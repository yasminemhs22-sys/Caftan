import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Locale, LocalizedText } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Récupère le texte dans la langue demandée, avec repli sur le français puis sur la première valeur disponible. */
export function getLocalized(value: LocalizedText | null | undefined, locale: string): string {
  if (!value) return ''
  const key = locale as Locale
  return value[key] || value.fr || Object.values(value).find(Boolean) || ''
}

export function formatPrice(amount: number, currency: string = 'DZD', locale: string = 'fr'): string {
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    maximumFractionDigits: 0,
  }).format(amount)
  return `${formatted} ${currency}`
}

export function generateOrderNumber(): string {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `LCDC-${y}${m}${d}-${rand}`
}

export function formatDate(value: string, locale: string = 'fr'): string {
  const dateLocale = locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-GB' : 'fr-FR'
  return new Intl.DateTimeFormat(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(value)
  )
}
