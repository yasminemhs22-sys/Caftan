/**
 * Abstraction volontairement minimale : "créer une session de paiement
 * hébergée" + "interpréter un webhook entrant". La quasi-totalité des
 * passerelles algériennes/internationales (Chargily, Stripe, SATIM...)
 * suivent ce même schéma "hosted checkout + webhook", donc changer de
 * fournisseur plus tard ne devrait toucher qu'un seul fichier
 * (lib/payments/<provider>.ts) sans rien changer au reste de l'app.
 */

export interface CreateCheckoutParams {
  orderId: string
  orderNumber: string
  /** Montant dans l'unité de base de la devise (DZD n'a pas de sous-unité
   *  utilisée en pratique — pas de conversion en centimes nécessaire). */
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  successUrl: string
  failureUrl: string
  webhookUrl: string
}

export interface CheckoutSession {
  /** URL vers laquelle rediriger la cliente pour payer. */
  checkoutUrl: string
  /** Identifiant de la session côté fournisseur, à stocker dans
   *  orders.payment_reference pour pouvoir rapprocher le webhook plus tard. */
  providerReference: string
}

export type PaymentEventType = 'payment.succeeded' | 'payment.failed' | 'payment.refunded' | 'unknown'

export interface ParsedWebhookEvent {
  type: PaymentEventType
  /** Identifiant unique de CET événement côté fournisseur (pas de la
   *  commande) — sert à l'idempotence via payment_events.provider_event_id. */
  providerEventId: string
  /** Référence de la session de paiement (= providerReference ci-dessus),
   *  pour retrouver la commande correspondante. */
  providerReference: string
  rawPayload: unknown
}

export interface PaymentProvider {
  name: string
  isConfigured(): boolean
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutSession>
  /** @param signatureHeader la valeur brute de l'en-tête de signature envoyé
   *  par le fournisseur (nom d'en-tête variable selon le fournisseur). */
  verifyAndParseWebhook(rawBody: string, signatureHeader: string | null): ParsedWebhookEvent
}
