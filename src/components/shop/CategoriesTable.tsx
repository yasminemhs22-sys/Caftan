'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalized } from '@/lib/utils'
import type { Category } from '@/types'

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [items, setItems] = useState(categories)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function toggleActive(cat: Category) {
    setBusyId(cat.id)
    const supabase = createClient()
    const { error } = await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    if (!error) {
      setItems((prev) => prev.map((c) => (c.id === cat.id ? { ...c, is_active: !c.is_active } : c)))
    }
    setBusyId(null)
  }

  async function handleDelete(cat: Category) {
    if (
      !confirm(
        `Supprimer « ${getLocalized(cat.name, 'fr')} » ? Les produits associés ne seront pas supprimés mais perdront leur catégorie.`
      )
    )
      return
    setBusyId(cat.id)
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    if (!error) {
      setItems((prev) => prev.filter((c) => c.id !== cat.id))
    }
    setBusyId(null)
    router.refresh()
  }

  if (!items.length) {
    return <p className="text-sm text-noir/50">Aucune catégorie. Cliquez sur « Ajouter » pour créer la première.</p>
  }

  return (
    <div className="overflow-x-auto border border-noir/10 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-noir/10 text-start text-xs uppercase tracking-widest2 text-noir/40">
            <th className="p-4 text-start">Nom</th>
            <th className="p-4 text-start">Slug</th>
            <th className="p-4 text-start">Statut</th>
            <th className="p-4 text-start">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((cat) => (
            <tr key={cat.id} className="border-b border-noir/5 last:border-0">
              <td className="p-4 text-noir">{getLocalized(cat.name, 'fr')}</td>
              <td className="p-4 text-noir/60">{cat.slug}</td>
              <td className="p-4">
                <button
                  onClick={() => toggleActive(cat)}
                  disabled={busyId === cat.id}
                  className={`px-2.5 py-1 text-xs uppercase tracking-widest2 ${
                    cat.is_active ? 'bg-dore/10 text-dore-dark' : 'bg-noir/5 text-noir/40'
                  }`}
                >
                  {cat.is_active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="p-4">
                <button
                  onClick={() => handleDelete(cat)}
                  disabled={busyId === cat.id}
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
