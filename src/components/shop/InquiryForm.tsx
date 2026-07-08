'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  city: z.string().min(1),
  message: z.string().min(3),
})

type FormValues = z.infer<typeof schema>

export function InquiryForm({ productId }: { productId: string }) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const supabase = createClient()
    const { error } = await supabase.from('messages').insert({
      type: 'product_inquiry',
      product_id: productId,
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone,
      email: values.email,
      city: values.city,
      message: values.message,
    })
    if (error) {
      setStatus('error')
      return
    }
    setStatus('success')
    reset()
  }

  const inputClass =
    'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'

  if (status === 'success') {
    return (
      <div className="border border-dore/40 bg-dore/5 p-6 text-center">
        <p className="text-sm text-noir">{t('inquiryForm.success')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <input placeholder={t('inquiryForm.firstName') as string} className={inputClass} {...register('first_name')} />
          {errors.first_name && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
        </div>
        <div>
          <input placeholder={t('inquiryForm.lastName') as string} className={inputClass} {...register('last_name')} />
          {errors.last_name && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
        </div>
        <div>
          <input placeholder={t('inquiryForm.phone') as string} className={inputClass} {...register('phone')} />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
        </div>
        <div>
          <input placeholder={t('inquiryForm.email') as string} className={inputClass} {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{t('common.invalidEmail')}</p>}
        </div>
        <div className="sm:col-span-2">
          <input placeholder={t('inquiryForm.city') as string} className={inputClass} {...register('city')} />
          {errors.city && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
        </div>
        <div className="sm:col-span-2">
          <textarea
            placeholder={t('inquiryForm.message') as string}
            rows={4}
            className={inputClass}
            {...register('message')}
          />
          {errors.message && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
        </div>
      </div>

      {status === 'error' && <p className="text-xs text-red-600">{t('inquiryForm.error')}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-noir px-7 py-3 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {t('inquiryForm.submit')}
      </button>
    </form>
  )
}
