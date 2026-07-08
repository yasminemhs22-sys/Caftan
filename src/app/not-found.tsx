'use client'

import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { LinkButton } from '@/components/ui/Button'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8 h-16 w-48">
        <Image src="/images/logo.jpg" alt="La Casa Del Caftan" fill className="object-contain" />
      </div>
      <h1 className="font-display text-6xl text-dore">{t('notFound.title')}</h1>
      <p className="mt-4 text-sm text-noir/60">{t('notFound.message')}</p>
      <div className="mt-10">
        <LinkButton href="/" variant="primary">{t('notFound.backHome')}</LinkButton>
      </div>
    </div>
  )
}
