import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CategoriesTable } from '@/components/shop/CategoriesTable'
import type { Category } from '@/types'

export default async function AdminCategoriesPage() {
  const supabase = createClient()
  const { data } = await supabase.from('categories').select('*').order('display_order')

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-noir">Catégories</h1>
        <Link
          href="/admin/categories/nouveau"
          className="flex items-center gap-2 bg-noir px-5 py-2.5 text-xs uppercase tracking-widest2 text-dore hover:opacity-90"
        >
          <Plus size={14} /> Ajouter
        </Link>
      </div>

      <CategoriesTable categories={(data as Category[]) || []} />
    </div>
  )
}
