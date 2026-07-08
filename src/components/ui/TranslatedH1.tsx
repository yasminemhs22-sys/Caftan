'use client'

import { useTranslation } from 'react-i18next'

export function TranslatedH1({ i18nKey, className }: { i18nKey: string; className?: string }) {
  const { t } = useTranslation()
  return <h1 className={className}>{t(i18nKey)}</h1>
}
