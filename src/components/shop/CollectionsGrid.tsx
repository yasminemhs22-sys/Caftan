'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { getLocalized } from '@/lib/utils'
import type { Collection } from '@/types'

export function CollectionsGrid({ collections }: { collections: Collection[] }) {
  const { t, i18n } = useTranslation()

  if (collections.length === 0) {
    return <p className="py-20 text-center text-sm text-noir/50">{t('collections.noCollections')}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((col) => (
        <Link key={col.id} href={`/collections/${col.slug}`} className="group block">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-noir">
            {col.image_url ? (
              <Image
                src={col.image_url}
                alt={getLocalized(col.name, i18n.language)}
                fill
                className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-noir to-noir-soft" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h2 className="font-display text-lg text-creme">{getLocalized(col.name, i18n.language)}</h2>
              <span className="mt-1 inline-block text-xs uppercase tracking-widest2 text-dore opacity-0 transition-opacity group-hover:opacity-100">
                {t('collections.viewCollection')}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
