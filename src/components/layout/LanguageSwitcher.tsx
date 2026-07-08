'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'العربية', short: 'AR' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Changer de langue"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs tracking-widest2 uppercase text-creme hover:text-dore transition-colors"
      >
        <Globe size={15} strokeWidth={1.5} />
        {current.short}
      </button>
      {open && (
        <div className="absolute end-0 mt-3 w-40 border border-dore/30 bg-noir shadow-xl z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between px-4 py-2.5 text-start text-sm hover:bg-dore/10 transition-colors',
                lang.code === i18n.language ? 'text-dore' : 'text-creme/80'
              )}
            >
              <span>{lang.label}</span>
              <span className="text-[10px] opacity-60">{lang.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
