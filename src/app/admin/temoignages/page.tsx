import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TestimonialsTable } from '@/components/shop/TestimonialsTable'
import type { Testimonial } from '@/types'

export default async function AdminTemoignagesPage() {
  const supabase = createClient()
  const { data } = await supabase.from('testimonials').select('*').order('display_order')

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-noir">Témoignages</h1>
        <Link
          href="/admin/temoignages/nouveau"
          className="flex items-center gap-2 bg-noir px-5 py-2.5 text-xs uppercase tracking-widest2 text-dore hover:opacity-90"
        >
          <Plus size={14} /> Ajouter
        </Link>
      </div>

      <TestimonialsTable items={(data as Testimonial[]) || []} />
    </div>
  )
}
