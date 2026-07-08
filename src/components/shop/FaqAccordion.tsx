'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getLocalized } from '@/lib/utils'
import type { FaqItem } from '@/types'

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const { i18n } = useTranslation()
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  if (!items.length) {
    return <p className="text-center text-sm text-noir/50">Aucune question pour le moment.</p>
  }

  return (
    <div className="divide-y divide-noir/10 border-y border-noir/10">
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between py-5 text-start"
              aria-expanded={isOpen}
            >
              <span className="font-display text-base text-noir">{getLocalized(item.question, i18n.language)}</span>
              <ChevronDown
                size={18}
                strokeWidth={1.5}
                className={`shrink-0 text-dore transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-sm leading-relaxed text-noir/60">{getLocalized(item.answer, i18n.language)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
