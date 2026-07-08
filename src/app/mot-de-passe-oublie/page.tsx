'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

const schema = z.object({ email: z.string().email() })
type FormValues = z.infer<typeof schema>

export default function MotDePasseOubliePage() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/connexion`,
    })
    // On affiche toujours le même message, que le compte existe ou non
    // (évite de révéler quels e-mails sont enregistrés).
    setSent(true)
  }

  const inputClass =
    'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-28">
      <h1 className="mb-2 text-center font-display text-2xl text-noir">{t('auth.forgotTitle')}</h1>
      <p className="mb-8 text-center text-sm text-noir/60">{t('auth.forgotSubtitle')}</p>

      {sent ? (
        <p className="border border-dore/40 bg-dore/5 p-5 text-center text-sm text-noir">{t('auth.linkSent')}</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input placeholder={t('auth.email') as string} className={inputClass} {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{t('common.invalidEmail')}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t('common.loading') : t('auth.sendLink')}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center text-xs text-noir/60">
        <Link href="/connexion" className="hover:text-dore-dark">
          {t('auth.backToLogin')}
        </Link>
      </div>
    </div>
  )
}
