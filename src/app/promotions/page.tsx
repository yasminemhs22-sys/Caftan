import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import type { Product } from '@/types'

export const metadata: Metadata = {
  title: 'Promotions',
  description: 'Profitez des offres et promotions en cours chez La Casa Del Caftan.',
}
export const revalidate = 30

export default async function PromotionsPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_active', true)
    .not('promo_price', 'is', null)
    .order('created_at', { ascending: false })

  // promo_price < price ne peut pas se filtrer côté requête (comparaison entre deux colonnes),
  // donc on l'applique ici pour ne garder que les vraies promotions.
  const products = ((data as Product[]) || []).filter((p) => p.promo_price != null && p.promo_price < p.price)

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <h1 className="mb-10 text-center font-display text-3xl text-noir md:text-4xl">Promotions</h1>

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-noir/50">Aucune promotion en cours pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
