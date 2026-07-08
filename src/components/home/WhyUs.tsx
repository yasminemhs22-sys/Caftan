'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gem, Truck, Heart, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { getLocalized } from '@/lib/utils'
import type { LocalizedText } from '@/types'

const ICONS: Record<string, React.ElementType> = { gem: Gem, truck: Truck, heart: Heart, sparkles: Sparkles }

interface WhyUsItem {
  icon: string
  title: LocalizedText
  text: LocalizedText
}

export function WhyUs() {
  const { i18n } = useTranslation()
  const [title, setTitle] = useState<LocalizedText>({})
  const [items, setItems] = useState<WhyUsItem[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('homepage_content')
      .select('why_us_title, why_us_items')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.why_us_title || {})
          setItems(data.why_us_items || [])
        }
      })
  }, [])

  if (!items.length) return null

  return (
    <section className="bg-creme py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <h2 className="mb-14 text-center font-display text-2xl text-noir md:text-3xl">
          {getLocalized(title, i18n.language)}
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[item.icon] || Sparkles
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-dore/40">
                  <Icon size={22} strokeWidth={1.25} className="text-dore-dark" />
                </div>
                <h3 className="mb-2 font-display text-lg text-noir">{getLocalized(item.title, i18n.language)}</h3>
                <p className="text-sm text-noir/60">{getLocalized(item.text, i18n.language)}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
