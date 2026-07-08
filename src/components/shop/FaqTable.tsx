'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalized } from '@/lib/utils'
import type { FaqItem } from '@/types'

export function FaqTable({ items: initialItems }: { items: FaqItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function toggleActive(item: FaqItem) {
    setBusyId(item.id)
    const supabase = createClient()
    const { error } = await supabase.from('faq').update({ is_active: !item.is_active }).eq('id', item.id)
    if (!error) {
      setItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, is_active: !f.is_active } : f)))
    }
    setBusyId(null)
  }

  async function handleDelete(item: FaqItem) {
    if (!confirm('Supprimer cette question ? Cette action est irréversible.')) return
    setBusyId(item.id)
    const supabase = createClient()
    const { error } = await supabase.from('faq').delete().eq('id', item.id)
    if (!error) {
      setItems((prev) => prev.filter((f) => f.id !== item.id))
    }
    setBusyId(null)
    router.refresh()
  }

  if (!items.length) {
    return <p className="text-sm text-noir/50">Aucune question. Cliquez sur « Ajouter » pour créer la première.</p>
  }

  return (
    <div className="divide-y divide-noir/10 border border-noir/10 bg-white">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-4 p-4">
          <p className="text-sm text-noir">{getLocalized(item.question, 'fr')}</p>
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => toggleActive(item)}
              disabled={busyId === item.id}
              className={`px-2.5 py-1 text-xs uppercase tracking-widest2 ${
                item.is_active ? 'bg-dore/10 text-dore-dark' : 'bg-noir/5 text-noir/40'
              }`}
            >
              {item.is_active ? 'Active' : 'Inactive'}
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
