import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CollectionBanner } from '@/components/shop/CollectionBanner'
import { ProductCard } from '@/components/shop/ProductCard'
import { getLocalized } from '@/lib/utils'
import type { Collection, Product } from '@/types'

export const revalidate = 60

async function getCollection(slug: string) {
  const supabase = createClient()
  const { data } = await supabase.from('collections').select('*').eq('slug', slug).eq('is_active', true).single()
  return data as Collection | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const collection = await getCollection(params.slug)
  if (!collection) return { title: 'Collection introuvable' }

  const title = getLocalized(collection.name, 'fr')
  const description = collection.description ? getLocalized(collection.description, 'fr') : undefined

  return { title, description: description?.slice(0, 160) }
}

export default async function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const collection = await getCollection(params.slug)
  if (!collection) notFound()

  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('collection_id', collection.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <Link
        href="/collections"
        className="mb-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest2 text-noir/50 hover:text-dore-dark"
      >
        <ChevronLeft size={14} /> Toutes les collections
      </Link>

      <CollectionBanner name={collection.name} description={collection.description} />

      <div className="mt-14">
        {!products || products.length === 0 ? (
          <p className="py-16 text-center text-sm text-noir/50">
            Aucun produit dans cette collection pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
            {(products as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
