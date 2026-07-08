'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalized } from '@/lib/utils'
import type { ContactInfo } from '@/types'

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  city: z.string().optional(),
  message: z.string().min(3),
})
type FormValues = z.infer<typeof schema>

const DAY_KEYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const

export function ContactContent({ contact }: { contact: ContactInfo }) {
  const { t, i18n } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const supabase = createClient()
    const { error } = await supabase.from('messages').insert({ type: 'contact', ...values, city: values.city || '' })
    if (error) {
      setStatus('error')
      return
    }
    setStatus('success')
    reset()
  }

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(contact.google_maps_query || '')}&output=embed`
  const inputClass =
    'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <h1 className="font-display text-3xl text-noir">{t('contact.title')}</h1>
      <p className="mt-2 text-sm text-noir/60">{t('contact.subtitle')}</p>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <ul className="space-y-5">
            <li className="flex items-start gap-3.5">
              <MapPin size={19} strokeWidth={1.5} className="mt-0.5 shrink-0 text-dore" />
              <div>
                <p className="text-xs uppercase tracking-widest2 text-noir/40">{t('contact.address')}</p>
                <p className="text-sm text-noir">{getLocalized(contact.address, i18n.language)}</p>
              </div>
            </li>
            <li className="flex items-start gap-3.5">
              <Phone size={19} strokeWidth={1.5} className="mt-0.5 shrink-0 text-dore" />
              <div>
                <p className="text-xs uppercase tracking-widest2 text-noir/40">{t('contact.phone')}</p>
                <a href={`tel:${contact.phone}`} className="text-sm text-noir hover:text-dore-dark">
                  {contact.phone}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3.5">
              <Mail size={19} strokeWidth={1.5} className="mt-0.5 shrink-0 text-dore" />
              <div>
                <p className="text-xs uppercase tracking-widest2 text-noir/40">{t('contact.email')}</p>
                <a href={`mailto:${contact.email}`} className="text-sm text-noir hover:text-dore-dark">
                  {contact.email}
                </a>
              </div>
            </li>
            {contact.opening_hours && Object.keys(contact.opening_hours).length > 0 && (
              <li className="flex items-start gap-3.5">
                <Clock size={19} strokeWidth={1.5} className="mt-0.5 shrink-0 text-dore" />
                <div>
                  <p className="mb-1 text-xs uppercase tracking-widest2 text-noir/40">{t('contact.hours')}</p>
                  <ul className="space-y-0.5 text-sm text-noir">
                    {DAY_KEYS.map(
                      (day) =>
                        contact.opening_hours?.[day] && (
                          <li key={day} className="flex justify-between gap-6">
                            <span className="text-noir/60">{t(`days.${day}`)}</span>
                            <span>{contact.opening_hours[day]}</span>
                          </li>
                        )
                    )}
                  </ul>
                </div>
              </li>
            )}
          </ul>

          <div className="mt-7 flex gap-3">
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-2 border border-noir px-5 py-2.5 text-xs uppercase tracking-widest2 text-noir hover:bg-noir hover:text-creme transition-colors"
            >
              <Phone size={14} /> {t('contact.callUs')}
            </a>
            <a
              href={`https://wa.me/${contact.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-[#25D366] px-5 py-2.5 text-xs uppercase tracking-widest2 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
            >
              <MessageCircle size={14} /> {t('contact.whatsappUs')}
            </a>
          </div>

          <div className="mt-10 aspect-video w-full overflow-hidden border border-noir/10">
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation La Casa Del Caftan"
            />
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-xs uppercase tracking-widest2 text-noir/50">{t('contact.formTitle')}</h2>
          {status === 'success' ? (
            <div className="border border-dore/40 bg-dore/5 p-6 text-sm text-noir">{t('inquiryForm.success')}</div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input placeholder={t('inquiryForm.firstName') as string} className={inputClass} {...register('first_name')} />
                <input placeholder={t('inquiryForm.lastName') as string} className={inputClass} {...register('last_name')} />
                <input placeholder={t('inquiryForm.phone') as string} className={inputClass} {...register('phone')} />
                <input placeholder={t('inquiryForm.email') as string} className={inputClass} {...register('email')} />
                <input placeholder={t('inquiryForm.city') as string} className={`sm:col-span-2 ${inputClass}`} {...register('city')} />
                <textarea
                  placeholder={t('inquiryForm.message') as string}
                  rows={5}
                  className={`sm:col-span-2 ${inputClass}`}
                  {...register('message')}
                />
              </div>
              {(errors.first_name || errors.last_name || errors.phone || errors.email || errors.message) && (
                <p className="text-xs text-red-600">{t('common.required')}</p>
              )}
              {status === 'error' && <p className="text-xs text-red-600">{t('inquiryForm.error')}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-noir px-7 py-3 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {t('common.send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
