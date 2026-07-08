'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getLocalized } from '@/lib/utils'
import type { GalleryItem } from '@/types'

export function Gallery({ images }: { images: GalleryItem[] }) {
  const { t, i18n } = useTranslation()

  if (images.length === 0) return null

  return (
    <section className="bg-noir py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <h2 className="mb-12 text-center font-display text-2xl text-creme md:text-3xl">
          {t('home.galleryTitle')}
        </h2>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative aspect-[4/3] overflow-hidden"
            >
              <Image
                src={img.image_url}
                alt={getLocalized(img.caption, i18n.language) || 'La Casa Del Caftan'}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 border border-dore/0 transition-colors duration-500 group-hover:border-dore/40" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
