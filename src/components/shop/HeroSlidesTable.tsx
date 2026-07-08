'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GripVertical, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalized } from '@/lib/utils'
import type { HeroSlide } from '@/types'

export function HeroSlidesTable({ slides: initialSlides }: { slides: HeroSlide[] }) {
  const [slides, setSlides] = useState(initialSlides)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault()
    if (!draggedId || draggedId === overId) return
    const draggedIndex = slides.findIndex((s) => s.id === draggedId)
    const overIndex = slides.findIndex((s) => s.id === overId)
    if (draggedIndex === -1 || overIndex === -1) return
    const next = [...slides]
    const [removed] = next.splice(draggedIndex, 1)
    next.splice(overIndex, 0, removed)
    setSlides(next)
  }

  async function persistOrder(items: HeroSlide[]) {
    setSaving(true)
    const supabase = createClient()
    await Promise.all(items.map((item, index) => supabase.from('hero_slides').update({ display_order: index }).eq('id', item.id)))
    setSaving(false)
  }

  async function toggleActive(slide: HeroSlide) {
    setBusyId(slide.id)
    const supabase = createClient()
    const { error } = await supabase.from('hero_slides').update({ is_active: !slide.is_active }).eq('id', slide.id)
    if (!error) {
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, is_active: !s.is_active } : s)))
    }
    setBusyId(null)
  }

  async function handleDelete(slide: HeroSlide) {
    if (!confirm('Supprimer cette diapositive ?')) return
    setBusyId(slide.id)
    const supabase = createClient()
    const { error } = await supabase.from('hero_slides').delete().eq('id', slide.id)
    if (!error) {
      setSlides((prev) => prev.filter((s) => s.id !== slide.id))
    }
    setBusyId(null)
  }

  if (!slides.length) {
    return <p className="text-sm text-noir/50">Aucune diapositive. Cliquez sur « Ajouter » pour créer la première.</p>
  }

  return (
    <div>
      <p className="mb-3 text-xs text-noir/40">
        Glissez-déposez pour réordonner. {saving && 'Enregistrement de l\u2019ordre…'}
      </p>
      <div className="divide-y divide-noir/10 border border-noir/10 bg-white">
        {slides.map((slide) => (
          <div
            key={slide.id}
            draggable
            onDragStart={() => setDraggedId(slide.id)}
            onDragOver={(e) => handleDragOver(e, slide.id)}
            onDragEnd={() => {
              setDraggedId(null)
              persistOrder(slides)
            }}
            className="flex items-center gap-4 p-4"
          >
            <GripVertical size={16} className="shrink-0 cursor-move text-noir/30" />
            <div className="relative h-14 w-24 shrink-0 overflow-hidden bg-noir">
              <Image src={slide.image_url} alt="" fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-noir">{getLocalized(slide.title, 'fr')}</p>
              <p className="truncate text-xs text-noir/40">{getLocalized(slide.subtitle, 'fr')}</p>
            </div>
            <button
              onClick={() => toggleActive(slide)}
              disabled={busyId === slide.id}
              className={`shrink-0 px-2.5 py-1 text-xs uppercase tracking-widest2 ${
                slide.is_active ? 'bg-dore/10 text-dore-dark' : 'bg-noir/5 text-noir/40'
              }`}
            >
              {slide.is_active ? 'Active' : 'Inactive'}
            </button>
            <button
              onClick={() => handleDelete(slide)}
              disabled={busyId === slide.id}
              aria-label="Supprimer"
              className="shrink-0 text-noir/40 hover:text-red-600"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
