'use client'

import { ReactNode, useEffect, useState } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import i18n, { RTL_LOCALES } from '@/lib/i18n'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'

function DirectionManager({ children }: { children: ReactNode }) {
  const { i18n: i18nInstance } = useTranslation()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const applyDirection = (lng: string) => {
      const dir = RTL_LOCALES.includes(lng) ? 'rtl' : 'ltr'
      document.documentElement.dir = dir
      document.documentElement.lang = lng
      document.documentElement.classList.toggle('font-arabic', lng === 'ar')
    }
    applyDirection(i18nInstance.language || 'fr')
    setReady(true)
    i18nInstance.on('languageChanged', applyDirection)
    return () => {
      i18nInstance.off('languageChanged', applyDirection)
    }
  }, [i18nInstance])

  // Évite un flash de mise en page avant que la langue stockée soit lue
  if (!ready) return null
  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <DirectionManager>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </DirectionManager>
    </I18nextProvider>
  )
}
