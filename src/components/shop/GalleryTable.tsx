'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GripVertical, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalized } from '@/lib/utils'
import type { GalleryItem } from '@/types'

export function GalleryTable({ images: initialImages }: { images: GalleryItem[] }) {
  const [images, setImages] = useState(initialImages)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault()
    if (!draggedId || draggedId === overId) return
    const draggedIndex = images.findIndex((img) => img.id === draggedId)
    const overIndex = images.findIndex((img) => img.id === overId)
    if (draggedIndex === -1 || overIndex === -1) return
    const next = [...images]
    const [removed] = next.splice(draggedIndex, 1)
    next.splice(overIndex, 0, removed)
    setImages(next)
  }

  async function persistOrder(items: GalleryItem[]) {
    setSaving(true)
    const supabase = createClient()
    await Promise.all(items.map((item, index) => supabase.from('gallery').update({ display_order: index }).eq('id', item.id)))
    setSaving(false)
  }

  async function toggleActive(image: GalleryItem) {
    setBusyId(image.id)
    const supabase = createClient()
    const { error } = await supabase.from('gallery').update({ is_active: !image.is_active }).eq('id', image.id)
    if (!error) {
      setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, is_active: !i.is_active } : i)))
    }
    setBusyId(null)
  }

  async function handleDelete(image: GalleryItem) {
    if (!confirm('Supprimer cette photo de la galerie ?')) return
    setBusyId(image.id)
    const supabase = createClient()
    const { error } = await supabase.from('gallery').delete().eq('id', image.id)
    if (!error) {
      setImages((prev) => prev.filter((i) => i.id !== image.id))
    }
    setBusyId(null)
  }

  if (!images.length) {
    return <p className="text-sm text-noir/50">Aucune photo. Cliquez sur « Ajouter » pour commencer.</p>
  }

  return (
    <div>
      <p className="mb-3 text-xs text-noir/40">
        Glissez-déposez pour réordonner. {saving && 'Enregistrement de l\u2019ordre…'}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => setDraggedId(image.id)}
            onDragOver={(e) => handleDragOver(e, image.id)}
            onDragEnd={() => {
              setDraggedId(null)
              persistOrder(images)
            }}
            className="group relative cursor-move overflow-hidden border border-noir/10 bg-white"
          >
            <div className="relative aspect-square w-full">
              <Image src={image.image_url} alt={getLocalized(image.caption, 'fr')} fill className="object-cover" />
              <div className="absolute inset-0 bg-noir/0 transition-colors group-hover:bg-noir/30" />
              <GripVertical size={16} className="absolute left-2 top-2 text-creme drop-shadow" />
            </div>
            <div className="flex items-center justify-between gap-2 p-2">
              <button
                onClick={() => toggleActive(image)}
                disabled={busyId === image.id}
                className={`px-2 py-1 text-[10px] uppercase tracking-widest2 ${
                  image.is_active ? 'bg-dore/10 text-dore-dark' : 'bg-noir/5 text-noir/40'
                }`}
              >
                {image.is_active ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => handleDelete(image)}
                disabled={busyId === image.id}
                aria-label="Supprimer"
                className="text-noir/40 hover:text-red-600"
              >
                <Trash2 size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
