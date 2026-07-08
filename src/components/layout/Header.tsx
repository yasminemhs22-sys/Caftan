'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Menu, X, ShoppingBag, User, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function Header({ logoUrl }: { logoUrl?: string | null }) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const { count } = useCart()
  const { ids: wishlistIds } = useWishlist()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setIsAuthenticated(!!data.user))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/boutique', label: t('nav.shop') },
    { href: '/collections', label: t('nav.collections') },
    { href: '/a-propos', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/faq', label: t('nav.faq') },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? 'bg-noir/95 backdrop-blur-sm py-2 shadow-lg shadow-black/20' : 'bg-noir/40 backdrop-blur-sm py-4'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="relative h-10 w-32 shrink-0 md:h-12 md:w-40">
          <Image
            src={logoUrl || '/images/logo.jpg'}
            alt="La Casa Del Caftan"
            fill
            className="object-contain mix-blend-screen"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-xs uppercase tracking-widest2 transition-colors hover:text-dore',
                pathname === link.href ? 'text-dore' : 'text-creme/90'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <Link
            href={isAuthenticated ? '/mon-compte' : '/connexion'}
            aria-label={t('nav.account')}
            className="hidden md:block text-creme/90 hover:text-dore transition-colors"
          >
            <User size={19} strokeWidth={1.5} />
          </Link>
          <Link href="/favoris" aria-label={t('nav.wishlist')} className="relative hidden md:block text-creme/90 hover:text-dore transition-colors">
            <Heart size={19} strokeWidth={1.5} />
            {wishlistIds.size > 0 && (
              <span className="absolute -top-2 -end-2 flex h-4 w-4 items-center justify-center rounded-full bg-dore text-[10px] font-medium text-noir">
                {wishlistIds.size}
              </span>
            )}
          </Link>
          <Link href="/panier" aria-label={t('nav.cart')} className="relative text-creme/90 hover:text-dore transition-colors">
            <ShoppingBag size={19} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-2 -end-2 flex h-4 w-4 items-center justify-center rounded-full bg-dore text-[10px] font-medium text-noir">
                {count}
              </span>
            )}
          </Link>
          <button
            className="text-creme lg:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-dore/20 bg-noir lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'py-2.5 text-sm uppercase tracking-widest2',
                    pathname === link.href ? 'text-dore' : 'text-creme/90'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link href={isAuthenticated ? '/mon-compte' : '/connexion'} className="py-2.5 text-sm uppercase tracking-widest2 text-creme/90">
                {t('nav.account')}
              </Link>
              <Link href="/favoris" className="py-2.5 text-sm uppercase tracking-widest2 text-creme/90">
                {t('nav.wishlist')} {wishlistIds.size > 0 && `(${wishlistIds.size})`}
              </Link>
              <div className="pt-3">
                <LanguageSwitcher />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
