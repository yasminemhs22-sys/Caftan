import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FaqTable } from '@/components/shop/FaqTable'
import type { FaqItem } from '@/types'

export default async function AdminFaqPage() {
  const supabase = createClient()
  const { data } = await supabase.from('faq').select('*').order('display_order')

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-noir">FAQ</h1>
        <Link
          href="/admin/faq/nouveau"
          className="flex items-center gap-2 bg-noir px-5 py-2.5 text-xs uppercase tracking-widest2 text-dore hover:opacity-90"
        >
          <Plus size={14} /> Ajouter
        </Link>
      </div>

      <FaqTable items={(data as FaqItem[]) || []} />
    </div>
  )
}
