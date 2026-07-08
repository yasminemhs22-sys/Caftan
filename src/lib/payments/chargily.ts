import crypto from 'crypto'
import type { PaymentProvider, CreateCheckoutParams, CheckoutSession, ParsedWebhookEvent } from './types'

/**
 * ⚠️ INTÉGRATION NON TESTÉE EN CONDITIONS RÉELLES
 * ================================================
 * Cette implémentation suit la structure générale documentée de l'API
 * Chargily Pay v2 (endpoint REST + clé secrète en Bearer token + webhook
 * signé en HMAC-SHA256) au moment de l'écriture de ce code. Mais ce
 * sandbox n'a pas d'accès réseau : aucun appel réel n'a pu être exécuté ni
 * vérifié contre l'API Chargily en conditions réelles.
 *
 * AVANT LA MISE EN PRODUCTION, VÉRIFIE CES 4 POINTS PRÉCIS CONTRE LA
 * DOCUMENTATION OFFICIELLE (https://dev.chargily.com) :
 *   1. L'URL de base ci-dessous (CHARGILY_API_BASE) et le chemin exact de
 *      l'endpoint de création de checkout.
 *   2. La forme exacte du corps de requête attendu par /checkouts (noms
 *      des champs, valeurs acceptées pour `payment_method`).
 *   3. Le nom de l'en-tête HTTP contenant la signature du webhook, et
 *      l'algorithme exact (HMAC-SHA256 est l'hypothèse ici).
 *   4. La forme exacte du payload JSON envoyé par le webhook (noms des
 *      champs dans `parseEventType` ci-dessous).
 * Fais un paiement test (Chargily fournit un mode test) et compare la
 * réponse réelle à ce que ce fichier attend, puis ajuste si besoin.
 */

const CHARGILY_API_BASE =
  process.env.CHARGILY_MODE === 'test' ? 'https://pay.chargily.net/test/api/v2' : 'https://pay.chargily.net/api/v2'

export const chargilyProvider: PaymentProvider = {
  name: 'chargily',

  isConfigured() {
    return !!(process.env.CHARGILY_SECRET_KEY && process.env.CHARGILY_WEBHOOK_SECRET)
  },

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutSession> {
    const secretKey = process.env.CHARGILY_SECRET_KEY
    if (!secretKey) {
      throw new Error('CHARGILY_SECRET_KEY manquante — configure les clés API dans les variables d\u2019environnement.')
    }

    const response = await fetch(`${CHARGILY_API_BASE}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency.toLowerCase(),
        success_url: params.successUrl,
        failure_url: params.failureUrl,
        webhook_endpoint: params.webhookUrl,
        // metadata revient tel quel dans l'événement webhook : c'est ce qui
        // permet de retrouver la commande sans dépendre uniquement de
        // providerReference (double sécurité de rapprochement).
        metadata: { order_id: params.orderId, order_number: params.orderNumber },
        customer: { email: params.customerEmail, name: params.customerName },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      throw new Error(`Chargily a refusé la création du paiement (${response.status}): ${errorBody}`)
    }

    const data = await response.json()
    // Hypothèse sur la forme de la réponse — à vérifier contre un vrai appel.
    const checkoutUrl = data.checkout_url
    const providerReference = data.id
    if (!checkoutUrl || !providerReference) {
      throw new Error('Réponse Chargily inattendue : checkout_url ou id manquant. Vérifie la forme de la réponse API.')
    }

    return { checkoutUrl, providerReference }
  },

  verifyAndParseWebhook(rawBody: string, signatureHeader: string | null): ParsedWebhookEvent {
    const webhookSecret = process.env.CHARGILY_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('CHARGILY_WEBHOOK_SECRET manquante — impossible de vérifier l\u2019authenticité du webhook.')
    }
    if (!signatureHeader) {
      throw new Error('En-tête de signature absent — requête rejetée (pourrait ne pas venir de Chargily).')
    }

    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')

    // Comparaison en temps constant pour éviter les attaques par timing.
    const signatureValid =
      expectedSignature.length === signatureHeader.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signatureHeader))

    if (!signatureValid) {
      throw new Error('Signature de webhook invalide — requête rejetée.')
    }

    const payload = JSON.parse(rawBody)
    // Hypothèse sur la forme de l'événement — à vérifier contre un vrai webhook reçu.
    const eventType = payload.type as string
    const checkout = payload.data

    return {
      type: mapEventType(eventType),
      providerEventId: payload.id || `${eventType}-${checkout?.id}-${Date.now()}`,
      providerReference: checkout?.id,
      rawPayload: payload,
    }
  },
}

function mapEventType(chargilyType: string): ParsedWebhookEvent['type'] {
  if (chargilyType === 'checkout.paid') return 'payment.succeeded'
  if (chargilyType === 'checkout.failed' || chargilyType === 'checkout.expired') return 'payment.failed'
  if (chargilyType === 'checkout.refunded') return 'payment.refunded'
  return 'unknown'
}
