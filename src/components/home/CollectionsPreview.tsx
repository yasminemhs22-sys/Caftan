'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getLocalized } from '@/lib/utils'
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder'
import type { Collection } from '@/types'

export function CollectionsPreview({ collections }: { collections: Collection[] }) {
  const { t, i18n } = useTranslation()

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
      <h2 className="mb-10 font-display text-2xl text-noir md:text-3xl">{t('home.collectionsTitle')}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {collections.map((col, i) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link href={`/boutique?collection=${col.slug}`} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-noir">
                {col.image_url ? (
                  <Image
                    src={col.image_url}
                    alt={getLocalized(col.name, i18n.language)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <ProductImagePlaceholder />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-transparent" />
                <span className="absolute bottom-5 start-5 font-display text-lg text-creme">
                  {getLocalized(col.name, i18n.language)}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
