'use client'

import { useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalized } from '@/lib/utils'
import type { Testimonial } from '@/types'

export function TestimonialsTable({ items: initialItems }: { items: Testimonial[] }) {
  const [items, setItems] = useState(initialItems)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function toggleApproved(item: Testimonial) {
    setBusyId(item.id)
    const supabase = createClient()
    const { error } = await supabase.from('testimonials').update({ is_approved: !item.is_approved }).eq('id', item.id)
    if (!error) {
      setItems((prev) => prev.map((t) => (t.id === item.id ? { ...t, is_approved: !t.is_approved } : t)))
    }
    setBusyId(null)
  }

  async function handleDelete(item: Testimonial) {
    if (!confirm(`Supprimer le témoignage de « ${item.customer_name} » ?`)) return
    setBusyId(item.id)
    const supabase = createClient()
    const { error } = await supabase.from('testimonials').delete().eq('id', item.id)
    if (!error) {
      setItems((prev) => prev.filter((t) => t.id !== item.id))
    }
    setBusyId(null)
  }

  if (!items.length) {
    return <p className="text-sm text-noir/50">Aucun témoignage. Cliquez sur « Ajouter » pour créer le premier.</p>
  }

  return (
    <div className="divide-y divide-noir/10 border border-noir/10 bg-white">
      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-4 p-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm text-noir">{item.customer_name}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < item.rating ? 'fill-dore text-dore' : 'text-noir/15'} />
                ))}
              </div>
            </div>
            <p className="text-sm text-noir/60">{getLocalized(item.comment, 'fr')}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => toggleApproved(item)}
              disabled={busyId === item.id}
              className={`px-2.5 py-1 text-xs uppercase tracking-widest2 ${
                item.is_approved ? 'bg-dore/10 text-dore-dark' : 'bg-noir/5 text-noir/40'
              }`}
            >
              {item.is_approved ? 'Visible' : 'Masqué'}
            </button>
            <button
              onClick={() => handleDelete(item)}
              disabled={busyId === item.id}
              aria-label="Supprimer"
              className="text-noir/40 hover:text-red-600"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
