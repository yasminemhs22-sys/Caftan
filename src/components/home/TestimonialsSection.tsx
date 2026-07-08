'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { getLocalized } from '@/lib/utils'
import type { Testimonial } from '@/types'

export function TestimonialsSection() {
  const { t, i18n } = useTranslation()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .order('display_order')
      .limit(3)
      .then(({ data }) => setTestimonials((data as Testimonial[]) || []))
  }, [])

  if (!testimonials.length) return null

  return (
    <section className="bg-creme py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <h2 className="mb-12 text-center font-display text-2xl text-noir md:text-3xl">
          {t('home.testimonialsTitle')}
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.id} className="border border-noir/10 bg-white p-7">
              <div className="mb-3 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className={i < item.rating ? 'fill-dore text-dore' : 'text-noir/15'} />
                ))}
              </div>
              <p className="mb-4 text-sm italic text-noir/70">
                {getLocalized(item.comment, i18n.language)}
              </p>
              <p className="text-xs uppercase tracking-widest2 text-noir/40">{item.customer_name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
