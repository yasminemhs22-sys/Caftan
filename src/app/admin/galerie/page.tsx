import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GalleryTable } from '@/components/shop/GalleryTable'
import type { GalleryItem } from '@/types'

export default async function AdminGaleriePage() {
  const supabase = createClient()
  const { data } = await supabase.from('gallery').select('*').order('display_order')

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-noir">Galerie</h1>
        <Link
          href="/admin/galerie/nouveau"
          className="flex items-center gap-2 bg-noir px-5 py-2.5 text-xs uppercase tracking-widest2 text-dore hover:opacity-90"
        >
          <Plus size={14} /> Ajouter
        </Link>
      </div>
      <p className="mb-6 text-sm text-noir/50">
        Ces photos s'affichent dans la section « Univers » de la page d'accueil.
      </p>

      <GalleryTable images={(data as GalleryItem[]) || []} />
    </div>
  )
}
