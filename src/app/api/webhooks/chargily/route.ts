import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveProvider } from '@/lib/payments'

/**
 * POST /api/webhooks/chargily
 *
 * Reçu directement par Chargily (appel serveur-à-serveur, pas de session
 * utilisateur) — d'où le client Supabase "admin" partout ici.
 *
 * ⚠️ Le nom de l'en-tête de signature ci-dessous ("signature") est une
 * hypothèse à vérifier contre la documentation officielle Chargily avant
 * mise en production (voir lib/payments/chargily.ts pour le détail des
 * points à confirmer).
 */
export async function POST(request: NextRequest) {
  // IMPORTANT : lire le corps BRUT (texte), sans JSON.parse préalable —
  // la vérification de signature porte sur les octets exacts reçus.
  const rawBody = await request.text()
  const signature = request.headers.get('signature')

  const provider = getActiveProvider()
  if (!provider) {
    return NextResponse.json({ error: 'Fournisseur de paiement non configuré.' }, { status: 400 })
  }

  let event
  try {
    event = provider.verifyAndParseWebhook(rawBody, signature)
  } catch (err: any) {
    console.error('Webhook paiement rejeté (signature ou payload invalide):', err.message)
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 401 })
  }

  const supabaseAdmin = createAdminClient()

  // Idempotence atomique : la contrainte unique (provider, provider_event_id)
  // fait le travail. Si Chargily renvoie deux fois le même événement (cas
  // fréquent avec les webhooks — c'est le comportement attendu de leur
  // part), la deuxième tentative échoue ici et on s'arrête sans rien
  // ré-appliquer.
  const { error: insertError } = await supabaseAdmin.from('payment_events').insert({
    provider: provider.name,
    provider_event_id: event.providerEventId,
    event_type: event.type,
    payload: event.rawPayload as any,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ received: true, alreadyProcessed: true })
    }
    console.error('Erreur en enregistrant payment_events:', insertError)
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 })
  }

  // Première fois qu'on voit cet événement : on applique ses effets.
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('payment_reference', event.providerReference)
    .single()

  if (order) {
    if (event.type === 'payment.succeeded') {
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          status: order.status === 'pending' ? 'confirmed' : order.status,
        })
        .eq('id', order.id)
    } else if (event.type === 'payment.failed') {
      await supabaseAdmin.from('orders').update({ payment_status: 'failed' }).eq('id', order.id)
    } else if (event.type === 'payment.refunded') {
      await supabaseAdmin.from('orders').update({ payment_status: 'refunded' }).eq('id', order.id)
    }

    await supabaseAdmin
      .from('payment_events')
      .update({ order_id: order.id })
      .eq('provider', provider.name)
      .eq('provider_event_id', event.providerEventId)
  } else {
    console.error(
      `Webhook reçu pour une référence de paiement inconnue: ${event.providerReference} — aucune commande correspondante trouvée.`
    )
  }

  return NextResponse.json({ received: true })
}
