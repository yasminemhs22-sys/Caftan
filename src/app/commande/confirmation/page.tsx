import type { Metadata } from 'next'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { LinkButton } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Confirmation de commande',
  robots: { index: false, follow: false },
}

/**
 * Utilise le client admin pour la lecture : une commande invitée (sans
 * compte) n'a pas de session permettant de passer les policies RLS
 * standards. On n'affiche volontairement qu'un sous-ensemble minimal
 * d'informations (numéro, statut, total) — jamais l'adresse ou le
 * téléphone — puisque cette page est accessible à quiconque connaît le
 * numéro de commande, comme sur la plupart des sites de e-commerce.
 */
export default async function CommandeConfirmationPage({
  searchParams,
}: {
  searchParams: { order?: string; echec?: string }
}) {
  const orderNumber = searchParams.order

  let order: { order_number: string; payment_status: string; total: number; payment_method: string } | null = null

  if (orderNumber) {
    const supabaseAdmin = createAdminClient()
    const { data } = await supabaseAdmin
      .from('orders')
      .select('order_number, payment_status, total, payment_method')
      .eq('order_number', orderNumber)
      .single()
    order = data
  }

  if (!order) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 pb-24 pt-32 text-center md:pt-40">
        <h1 className="font-display text-2xl text-noir">Commande introuvable</h1>
        <p className="mt-3 text-sm text-noir/60">
          Vérifie le lien utilisé, ou contacte-nous si tu penses qu'il s'agit d'une erreur.
        </p>
        <LinkButton href="/boutique" variant="primary" className="mt-8">
          Retour à la boutique
        </LinkButton>
      </div>
    )
  }

  const failed = searchParams.echec === '1' || order.payment_status === 'failed'
  const paid = order.payment_status === 'paid'

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 pb-24 pt-32 text-center md:pt-40">
      {paid ? (
        <CheckCircle2 size={52} strokeWidth={1} className="mb-6 text-dore" />
      ) : failed ? (
        <XCircle size={52} strokeWidth={1} className="mb-6 text-red-500" />
      ) : (
        <Clock size={52} strokeWidth={1} className="mb-6 text-noir/40" />
      )}

      <h1 className="font-display text-2xl text-noir">
        {paid ? 'Paiement confirmé !' : failed ? 'Le paiement a échoué' : 'Paiement en attente de confirmation'}
      </h1>
      <p className="mt-3 text-sm text-noir/60">
        {paid
          ? 'Merci pour votre commande. Notre équipe la prépare dès maintenant.'
          : failed
            ? "Le paiement n'a pas abouti. Vous pouvez réessayer ou choisir un autre moyen de paiement."
            : "Nous attendons la confirmation de votre banque — cette page se mettra à jour automatiquement d'ici quelques instants. Si rien ne change après plusieurs minutes, contactez-nous avec votre numéro de commande."}
      </p>
      <p className="mt-4 text-sm text-noir">
        Commande : <span className="text-dore-dark">{order.order_number}</span>
      </p>
      <p className="mt-1 text-sm text-noir/70">{formatPrice(order.total, 'DA', 'fr')}</p>

      <LinkButton href="/boutique" variant="primary" className="mt-8">
        Retour à la boutique
      </LinkButton>
    </div>
  )
}
