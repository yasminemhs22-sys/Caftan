'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalized } from '@/lib/utils'
import type { Collection } from '@/types'

export function CollectionsTable({ collections }: { collections: Collection[] }) {
  const router = useRouter()
  const [items, setItems] = useState(collections)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function toggleActive(col: Collection) {
    setBusyId(col.id)
    const supabase = createClient()
    const { error } = await supabase.from('collections').update({ is_active: !col.is_active }).eq('id', col.id)
    if (!error) {
      setItems((prev) => prev.map((c) => (c.id === col.id ? { ...c, is_active: !c.is_active } : c)))
    }
    setBusyId(null)
  }

  async function handleDelete(col: Collection) {
    if (
      !confirm(
        `Supprimer « ${getLocalized(col.name, 'fr')} » ? Les produits associés ne seront pas supprimés mais perdront leur collection.`
      )
    )
      return
    setBusyId(col.id)
    const supabase = createClient()
    const { error } = await supabase.from('collections').delete().eq('id', col.id)
    if (!error) {
      setItems((prev) => prev.filter((c) => c.id !== col.id))
    }
    setBusyId(null)
    router.refresh()
  }

  if (!items.length) {
    return <p className="text-sm text-noir/50">Aucune collection. Cliquez sur « Ajouter » pour créer la première.</p>
  }

  return (
    <div className="overflow-x-auto border border-noir/10 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-noir/10 text-start text-xs uppercase tracking-widest2 text-noir/40">
            <th className="p-4 text-start">Collection</th>
            <th className="p-4 text-start">Slug</th>
            <th className="p-4 text-start">Mise en avant</th>
            <th className="p-4 text-start">Statut</th>
            <th className="p-4 text-start">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((col) => (
            <tr key={col.id} className="border-b border-noir/5 last:border-0">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-noir">
                    {col.image_url && <Image src={col.image_url} alt="" fill className="object-cover" />}
                  </div>
                  <span className="text-noir">{getLocalized(col.name, 'fr')}</span>
                </div>
              </td>
              <td className="p-4 text-noir/60">{col.slug}</td>
              <td className="p-4 text-noir/60">{col.is_featured ? 'Oui' : '—'}</td>
              <td className="p-4">
                <button
                  onClick={() => toggleActive(col)}
                  disabled={busyId === col.id}
                  className={`px-2.5 py-1 text-xs uppercase tracking-widest2 ${
                    col.is_active ? 'bg-dore/10 text-dore-dark' : 'bg-noir/5 text-noir/40'
                  }`}
                >
                  {col.is_active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="p-4">
                <button
                  onClick={() => handleDelete(col)}
                  disabled={busyId === col.id}
                  aria-label="Supprimer"
                  className="text-noir/40 hover:text-red-600"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
