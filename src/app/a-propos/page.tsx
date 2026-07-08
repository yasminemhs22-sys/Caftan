import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { AboutBodyClient } from '@/components/shop/AboutBodyClient'
import { getSiteContentMap } from '@/lib/settings'
import type { LocalizedText, GalleryItem } from '@/types'

export const metadata: Metadata = {
  title: 'À propos',
  description: "Découvrez l'histoire et les valeurs de La Casa Del Caftan, maison de mode féminine haut de gamme.",
}

export default async function AProposPage() {
  const supabase = createClient()
  const [siteContent, { data: photos }] = await Promise.all([
    getSiteContentMap(),
    supabase.from('gallery').select('*').eq('is_active', true).order('display_order').limit(2),
  ])

  const body: LocalizedText =
    siteContent.about_page_body || {
      fr: "La Casa Del Caftan est une maison dédiée à l'élégance féminine, entre héritage et modernité.",
    }
  const galleryPhotos = (photos || []) as GalleryItem[]

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <h1 className="mb-8 text-center font-display text-3xl text-noir md:text-4xl">À propos de La Casa Del Caftan</h1>

      <AboutBodyClient body={body} />

      {galleryPhotos.length > 0 && (
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {galleryPhotos.map((photo) => (
            <div key={photo.id} className="relative aspect-[4/3] overflow-hidden">
              <Image src={photo.image_url} alt="La Casa Del Caftan" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
