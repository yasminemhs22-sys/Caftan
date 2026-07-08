import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CollectionsTable } from '@/components/shop/CollectionsTable'
import type { Collection } from '@/types'

export default async function AdminCollectionsPage() {
  const supabase = createClient()
  const { data } = await supabase.from('collections').select('*').order('display_order')

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-noir">Collections</h1>
        <Link
          href="/admin/collections/nouveau"
          className="flex items-center gap-2 bg-noir px-5 py-2.5 text-xs uppercase tracking-widest2 text-dore hover:opacity-90"
        >
          <Plus size={14} /> Ajouter
        </Link>
      </div>

      <CollectionsTable collections={(data as Collection[]) || []} />
    </div>
  )
}
