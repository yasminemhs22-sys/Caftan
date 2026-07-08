import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * ⚠️ Ce client contourne complètement les policies RLS. Il ne doit JAMAIS
 * être importé dans un composant client ('use client') ni exposé au
 * navigateur — seulement utilisé dans des Route Handlers serveur qui n'ont
 * pas de session utilisateur (typiquement : le webhook de paiement, qui
 * reçoit un appel serveur-à-serveur de Chargily et doit pouvoir mettre à
 * jour une commande sans être "connecté" en tant que ce client).
 *
 * SUPABASE_SERVICE_ROLE_KEY (SANS préfixe NEXT_PUBLIC_) doit être définie
 * uniquement dans les variables d'environnement du serveur de déploiement
 * (Netlify), jamais commitée, jamais préfixée NEXT_PUBLIC_.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY manquante — nécessaire pour les routes serveur de confiance (webhooks de paiement). Voir .env.example.'
    )
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
