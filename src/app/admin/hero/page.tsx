import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { HeroSlidesTable } from '@/components/shop/HeroSlidesTable'
import type { HeroSlide } from '@/types'

export default async function AdminHeroPage() {
  const supabase = createClient()
  const { data } = await supabase.from('hero_slides').select('*').order('display_order')

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-noir">Bannières &amp; Hero</h1>
        <Link
          href="/admin/hero/nouveau"
          className="flex items-center gap-2 bg-noir px-5 py-2.5 text-xs uppercase tracking-widest2 text-dore hover:opacity-90"
        >
          <Plus size={14} /> Ajouter
        </Link>
      </div>
      <p className="mb-6 text-sm text-noir/50">
        Ces diapositives s'affichent en rotation automatique dans le grand visuel de la page d'accueil.
      </p>

      <HeroSlidesTable slides={(data as HeroSlide[]) || []} />
    </div>
  )
}
