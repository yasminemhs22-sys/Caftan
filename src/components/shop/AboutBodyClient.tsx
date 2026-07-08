'use client'

import { useTranslation } from 'react-i18next'
import { getLocalized } from '@/lib/utils'
import type { LocalizedText } from '@/types'

export function AboutBodyClient({ body }: { body: LocalizedText }) {
  const { i18n } = useTranslation()
  return <p className="text-center text-base leading-relaxed text-noir/70">{getLocalized(body, i18n.language)}</p>
}
