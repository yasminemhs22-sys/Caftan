'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalized } from '@/lib/utils'
import type { ContactInfo, LocalizedText } from '@/types'

interface SocialLinks {
  instagram?: string
  facebook?: string
  tiktok?: string
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  )
}

interface Props {
  logoUrl?: string | null
  socialLinks?: SocialLinks | null
  contactInfo?: ContactInfo | null
  tagline?: LocalizedText | null
}

const DEFAULT_TAGLINE: LocalizedText = {
  fr: "L'élégance du caftan, réinventée.",
  en: 'The elegance of the caftan, reinvented.',
  ar: 'أناقة القفطان، بروح عصرية.',
}

export function Footer({ logoUrl, socialLinks, contactInfo, tagline }: Props) {
  const { t, i18n } = useTranslation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.from('newsletter_subscribers').insert({ email })
    if (error && error.code !== '23505') {
      setStatus('error')
      return
    }
    setStatus('success')
    setEmail('')
  }

  const year = new Date().getFullYear()
  const social = socialLinks || {}

  return (
    <footer className="border-t border-dore/20 bg-noir text-creme/80">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-4 md:px-8">
        <div>
          <div className="relative mb-4 h-14 w-40">
            <Image src={logoUrl || '/images/logo.jpg'} alt="La Casa Del Caftan" fill className="object-contain mix-blend-screen" />
          </div>
          <p className="text-sm text-creme/60">{getLocalized(tagline || DEFAULT_TAGLINE, i18n.language)}</p>
          {(social.instagram || social.facebook || social.tiktok) && (
            <div className="mt-5 flex gap-4">
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-creme/60 hover:text-dore transition-colors">
                  <Instagram size={18} strokeWidth={1.5} />
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-creme/60 hover:text-dore transition-colors">
                  <Facebook size={18} strokeWidth={1.5} />
                </a>
              )}
              {social.tiktok && (
                <a href={social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-creme/60 hover:text-dore transition-colors">
                  <TikTokIcon size={18} />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-xs uppercase tracking-widest2 text-dore">{t('footer.quickLinks')}</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/boutique" className="hover:text-dore transition-colors">{t('nav.shop')}</Link></li>
            <li><Link href="/collections" className="hover:text-dore transition-colors">{t('nav.collections')}</Link></li>
            <li><Link href="/nouveautes" className="hover:text-dore transition-colors">{t('nav.newArrivals')}</Link></li>
            <li><Link href="/promotions" className="hover:text-dore transition-colors">{t('nav.promotions')}</Link></li>
            <li><Link href="/a-propos" className="hover:text-dore transition-colors">{t('nav.about')}</Link></li>
            <li><Link href="/faq" className="hover:text-dore transition-colors">{t('nav.faq')}</Link></li>
            <li><Link href="/confidentialite" className="hover:text-dore transition-colors">Politique de confidentialité</Link></li>
            <li><Link href="/conditions-generales" className="hover:text-dore transition-colors">Conditions générales</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs uppercase tracking-widest2 text-dore">{t('footer.contact')}</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-dore" />
              <span>{contactInfo ? getLocalized(contactInfo.address, i18n.language) : 'RN24, Alger Plage, Algérie, 16000'}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} strokeWidth={1.5} className="shrink-0 text-dore" />
              <a href={`tel:${contactInfo?.phone || '0540984852'}`} className="hover:text-dore transition-colors">
                {contactInfo?.phone || '0540984852'}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} strokeWidth={1.5} className="shrink-0 text-dore" />
              <a href={`mailto:${contactInfo?.email || 'casacaftan16@gmail.com'}`} className="hover:text-dore transition-colors">
                {contactInfo?.email || 'casacaftan16@gmail.com'}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs uppercase tracking-widest2 text-dore">{t('footer.newsletter')}</h3>
          <p className="mb-4 text-sm text-creme/60">{t('footer.newsletterText')}</p>
          {status === 'success' ? (
            <p className="text-sm text-dore">{t('footer.subscribeSuccess')}</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletterPlaceholder') as string}
                className="w-full border border-creme/20 bg-transparent px-3 py-2.5 text-sm placeholder:text-creme/40 focus:border-dore focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="shrink-0 border border-dore bg-dore px-4 text-xs uppercase tracking-widest2 text-noir transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {t('footer.subscribe')}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-dore/10 px-6 py-5 text-center text-xs text-creme/40 md:px-8">
        © {year} La Casa Del Caftan. {t("footer.rights")}
        {" · "}
        <Link href="/admin" className="text-creme/40 underline hover:text-dore">
          Espace Pro
        </Link>
      </div>
    </footer>
  )
}
