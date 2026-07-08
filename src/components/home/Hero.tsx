'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LinkButton } from '@/components/ui/Button'
import { getLocalized } from '@/lib/utils'
import type { HeroSlide } from '@/types'

const AUTO_ADVANCE_MS = 7000

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const { t, i18n } = useTranslation()
  const [active, setActive] = useState(0)

  const hasMultiple = slides.length > 1

  useEffect(() => {
    if (!hasMultiple) return
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [hasMultiple, slides.length])

  if (slides.length === 0) return null

  const slide = slides[active]

  return (
    <section className="relative flex h-[100svh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-noir">
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image_url}
            alt={getLocalized(slide.title, i18n.language)}
            fill
            priority={active === 0}
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-noir/60 to-noir" />
        </motion.div>
      </AnimatePresence>

      {/* effet de lumière subtil */}
      <div className="pointer-events-none absolute -top-1/3 left-1/2 h-[70vh] w-[70vh] -translate-x-1/2 rounded-full bg-dore/10 blur-[120px]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
        >
          <span className="mb-5 text-xs uppercase tracking-widest2 text-dore">{t('hero.eyebrow')}</span>
          <h1 className="font-display text-4xl leading-tight text-creme md:text-6xl">
            {getLocalized(slide.title, i18n.language)}
          </h1>
          {slide.subtitle && Object.keys(slide.subtitle).length > 0 && (
            <p className="mt-6 max-w-xl text-sm text-creme/70 md:text-base">
              {getLocalized(slide.subtitle, i18n.language)}
            </p>
          )}
          <div className="mt-10">
            <LinkButton href={slide.cta_link || '/boutique'} variant="primary">
              {slide.cta_text && Object.keys(slide.cta_text).length > 0
                ? getLocalized(slide.cta_text, i18n.language)
                : getLocalized({ fr: 'Découvrir', en: 'Discover', ar: 'اكتشفي' }, i18n.language)}
            </LinkButton>
          </div>
        </motion.div>
      </AnimatePresence>

      {hasMultiple && (
        <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              aria-label={`Diapositive ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-dore' : 'w-1.5 bg-creme/40'}`}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-dore/60 to-transparent"
      />
    </section>
  )
}
