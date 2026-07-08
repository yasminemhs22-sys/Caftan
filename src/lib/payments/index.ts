import { chargilyProvider } from './chargily'
import type { PaymentProvider } from './types'

/**
 * Un seul fournisseur actif à la fois pour cette livraison (Chargily).
 * Pour brancher un autre fournisseur (SATIM, Edahabia direct, Stripe pour
 * l'international...) : créer lib/payments/<nom>.ts en suivant le même
 * modèle que chargily.ts, puis l'ajouter ici.
 */
const PROVIDERS: Record<string, PaymentProvider> = {
  chargily: chargilyProvider,
}

export function getActiveProvider(): PaymentProvider | null {
  const provider = PROVIDERS.chargily
  return provider.isConfigured() ? provider : null
}

export type { PaymentProvider, CreateCheckoutParams, CheckoutSession, ParsedWebhookEvent } from './types'
