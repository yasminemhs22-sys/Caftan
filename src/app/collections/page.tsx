import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CollectionsGrid } from '@/components/shop/CollectionsGrid'
import type { Collection } from '@/types'

export const metadata: Metadata = {
  title: 'Nos collections',
  description: 'Découvrez les collections de La Casa Del Caftan, entre héritage et modernité.',
}
export const revalidate = 60

export default async function CollectionsPage() {
  const supabase = createClient()
  const { data } = await supabase.from('collections').select('*').eq('is_active', true).order('display_order')

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <h1 className="mb-10 text-center font-display text-3xl text-noir md:text-4xl">Nos collections</h1>
      <CollectionsGrid collections={(data as Collection[]) || []} />
    </div>
  )
}
