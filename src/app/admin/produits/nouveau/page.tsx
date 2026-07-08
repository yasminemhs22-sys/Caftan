import { createClient } from '@/lib/supabase/server'
import { NewProductForm } from '@/components/shop/NewProductForm'
import type { Category } from '@/types'

export default async function NouveauProduitPage() {
  const supabase = createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('display_order')

  return (
    <div className="max-w-3xl">
      <h1 className="mb-8 font-display text-2xl text-noir">Ajouter un produit</h1>
      <NewProductForm categories={(categories as Category[]) || []} />
    </div>
  )
}
