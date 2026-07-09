import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditProductForm } from '@/components/shop/EditProductForm'
import type { Category, Product } from '@/types'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, product_images(*)').eq('id', params.id).single(),
    supabase.from('categories').select('*').order('display_order'),
  ])

  if (!product) notFound()

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl text-noir">Modifier le produit</h1>
      <EditProductForm product={product as Product} categories={(categories as Category[]) || []} />
    </div>
  )
}
