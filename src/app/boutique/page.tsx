import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProductFilters } from '@/components/shop/ProductFilters'
import { ProductCard } from '@/components/shop/ProductCard'
import { TranslatedH1 } from '@/components/ui/TranslatedH1'
import type { Product, Category } from '@/types'

export const metadata: Metadata = {
  title: 'Boutique',
  description: 'Découvrez toute la collection La Casa Del Caftan : caftans, robes de soirée et accessoires.',
}

export const revalidate = 60

interface SearchParams {
  category?: string
  collection?: string
  color?: string
  size?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
  q?: string
}

async function getProducts(params: SearchParams) {
  const supabase = createClient()
  let query = supabase.from('products').select('*, product_images(*)').eq('is_active', true)

  if (params.category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', params.category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (params.collection) {
    const { data: col } = await supabase.from('collections').select('id').eq('slug', params.collection).single()
    if (col) query = query.eq('collection_id', col.id)
  }
  if (params.color) query = query.contains('colors', [params.color])
  if (params.size) query = query.contains('sizes', [params.size])
  if (params.minPrice) query = query.gte('price', Number(params.minPrice))
  if (params.maxPrice) query = query.lte('price', Number(params.maxPrice))
  if (params.inStock === '1') query = query.gt('stock_quantity', 0)
  if (params.q) query = query.or(`sku.ilike.%${params.q}%`)

  switch (params.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'popularity':
      query = query.order('is_featured', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data } = await query
  return (data || []) as Product[]
}

export default async function BoutiquePage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()
  const [products, { data: categories }] = await Promise.all([
    getProducts(searchParams),
    supabase.from('categories').select('*').eq('is_active', true).order('display_order'),
  ])

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <TranslatedH1 i18nKey="shop.title" className="mb-10 font-display text-3xl text-noir" />

      <div className="flex flex-col gap-10 lg:flex-row">
        <ProductFilters categories={(categories as Category[]) || []} current={searchParams} />

        <div className="flex-1">
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <p className="text-sm text-noir/50">{products.length} produit(s)</p>
          </div>

          {products.length === 0 ? (
            <p className="py-20 text-center text-sm text-noir/50">Aucun produit ne correspond à votre recherche pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
