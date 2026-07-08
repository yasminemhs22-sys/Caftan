import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductsTable } from '@/components/shop/ProductsTable'
import type { Product } from '@/types'

export default async function AdminProduitsPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-noir">Produits</h1>
        <Link
          href="/admin/produits/nouveau"
          className="flex items-center gap-2 bg-noir px-5 py-2.5 text-xs uppercase tracking-widest2 text-dore hover:opacity-90"
        >
          <Plus size={14} /> Ajouter
        </Link>
      </div>

      <ProductsTable products={(data as Product[]) || []} />
    </div>
  )
}
