import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import type { Product } from '@/types'

export const metadata: Metadata = {
  title: 'Nouveautés',
  description: 'Découvrez les dernières nouveautés de La Casa Del Caftan.',
}
export const revalidate = 30

export default async function NouveautesPage() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_active', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <h1 className="mb-10 text-center font-display text-3xl text-noir md:text-4xl">Nouveautés</h1>

      {!products || products.length === 0 ? (
        <p className="py-16 text-center text-sm text-noir/50">Aucune nouveauté pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
