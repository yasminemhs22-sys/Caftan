'use client'

import { useTranslation } from 'react-i18next'
import { getLocalized } from '@/lib/utils'
import type { LocalizedText } from '@/types'

export function CollectionBanner({ name, description }: { name: LocalizedText; description: LocalizedText | null }) {
  const { i18n } = useTranslation()
  return (
    <div className="text-center">
      <h1 className="font-display text-3xl text-noir md:text-4xl">{getLocalized(name, i18n.language)}</h1>
      {description && Object.keys(description).length > 0 && (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-noir/60">
          {getLocalized(description, i18n.language)}
        </p>
      )}
    </div>
  )
}
