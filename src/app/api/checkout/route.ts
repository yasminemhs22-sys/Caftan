import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveProvider } from '@/lib/payments'

/**
 * POST /api/checkout
 * Body attendu : { orderId: string }
 *
 * La commande doit déjà exister (créée juste avant côté panier, avec
 * payment_method='online'). Cette route relit son montant EN BASE (jamais
 * une valeur envoyée par le client) avant de créer la session de paiement,
 * pour empêcher toute manipulation du montant facturé.
 */
export async function POST(request: NextRequest) {
  let body: { orderId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  if (!body.orderId) {
    return NextResponse.json({ error: 'orderId manquant.' }, { status: 400 })
  }

  const provider = getActiveProvider()
  if (!provider) {
    return NextResponse.json(
      { error: "Le paiement en ligne n'est pas configuré (clés API manquantes)." },
      { status: 400 }
    )
  }

  const supabaseAdmin = createAdminClient()
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', body.orderId)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 })
  }
  if (order.payment_status === 'paid') {
    return NextResponse.json({ error: 'Cette commande est déjà payée.' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin

  try {
    const session = await provider.createCheckout({
      orderId: order.id,
      orderNumber: order.order_number,
      amount: order.total,
      currency: 'dzd',
      customerEmail: order.customer_email,
      customerName: `${order.customer_first_name} ${order.customer_last_name}`,
      successUrl: `${siteUrl}/commande/confirmation?order=${order.order_number}`,
      failureUrl: `${siteUrl}/commande/confirmation?order=${order.order_number}&echec=1`,
      webhookUrl: `${siteUrl}/api/webhooks/chargily`,
    })

    await supabaseAdmin
      .from('orders')
      .update({ payment_provider: provider.name, payment_reference: session.providerReference })
      .eq('id', order.id)

    return NextResponse.json({ checkoutUrl: session.checkoutUrl })
  } catch (err: any) {
    console.error('Erreur création session de paiement:', err)
    return NextResponse.json({ error: err.message || 'Erreur lors de la création du paiement.' }, { status: 500 })
  }
}
