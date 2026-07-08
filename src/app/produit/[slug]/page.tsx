import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductDetailClient } from '@/components/shop/ProductDetailClient'
import { getLocalized } from '@/lib/utils'
import type { Product } from '@/types'

export const revalidate = 60

async function getProduct(slug: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as Product | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Produit introuvable' }

  const title = getLocalized(product.meta_title?.fr ? product.meta_title : product.name, 'fr')
  const description = getLocalized(
    product.meta_description?.fr ? product.meta_description : product.description,
    'fr'
  )

  return {
    title,
    description: description?.slice(0, 160),
    openGraph: {
      title,
      description: description?.slice(0, 160),
      images: product.product_images?.[0]?.url ? [product.product_images[0].url] : ['/images/logo.jpg'],
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const [{ data: similar }, { data: reviews }] = await Promise.all([
    supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('is_active', true)
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .limit(4),
    supabase
      .from('reviews')
      .select('id, customer_name, rating, comment')
      .eq('product_id', product.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false }),
  ])

  return (
    <ProductDetailClient
      product={product}
      similarProducts={(similar as Product[]) || []}
      reviews={reviews || []}
    />
  )
}
