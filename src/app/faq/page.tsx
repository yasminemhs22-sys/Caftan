import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { FaqAccordion } from '@/components/shop/FaqAccordion'
import { TranslatedH1 } from '@/components/ui/TranslatedH1'
import type { FaqItem } from '@/types'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Questions fréquentes sur les commandes, la livraison et le paiement chez La Casa Del Caftan.',
}

export default async function FaqPage() {
  const supabase = createClient()
  const { data } = await supabase.from('faq').select('*').eq('is_active', true).order('display_order')

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <TranslatedH1 i18nKey="faq.title" className="mb-2 text-center font-display text-3xl text-noir" />
      <p className="mb-12 text-center text-sm text-noir/60">Tout ce qu'il faut savoir avant de commander.</p>
      <FaqAccordion items={(data as FaqItem[]) || []} />
    </div>
  )
}
