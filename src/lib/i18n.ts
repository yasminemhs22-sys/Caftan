'use client'

import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import fr from '@/locales/fr/common.json'
import en from '@/locales/en/common.json'
import ar from '@/locales/ar/common.json'

export const SUPPORTED_LOCALES = ['fr', 'en', 'ar'] as const
export const DEFAULT_LOCALE = 'fr'
export const RTL_LOCALES = ['ar']

if (!i18next.isInitialized) {
  i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        fr: { common: fr },
        en: { common: en },
        ar: { common: ar },
      },
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: SUPPORTED_LOCALES as unknown as string[],
      defaultNS: 'common',
      ns: ['common'],
      detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: 'lcdc-language',
        caches: ['localStorage'],
      },
      interpolation: { escapeValue: false },
    })
}

export default i18next
