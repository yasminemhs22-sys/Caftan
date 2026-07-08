'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

const schema = z
  .object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    confirm_password: z.string().min(6),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'passwords_mismatch',
    path: ['confirm_password'],
  })
type FormValues = z.infer<typeof schema>

export default function InscriptionPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setError(null)
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { first_name: values.first_name, last_name: values.last_name } },
    })
    if (authError) {
      setError(authError.message)
      return
    }
    if (data.session) {
      router.push('/')
      router.refresh()
    } else {
      // Confirmation par e-mail activée côté Supabase Auth
      setSuccess(true)
    }
  }

  const inputClass =
    'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'

  if (success) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 py-28 text-center">
        <h1 className="mb-3 font-display text-2xl text-noir">{t('auth.registerTitle')}</h1>
        <p className="text-sm text-noir/60">
          Un e-mail de confirmation vient de vous être envoyé. Vérifiez votre boîte de réception pour activer votre compte.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-28">
      <h1 className="mb-8 text-center font-display text-2xl text-noir">{t('auth.registerTitle')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input placeholder={t('auth.firstName') as string} className={inputClass} {...register('first_name')} />
          <input placeholder={t('auth.lastName') as string} className={inputClass} {...register('last_name')} />
        </div>
        <input placeholder={t('auth.email') as string} className={inputClass} {...register('email')} />
        <input type="password" placeholder={t('auth.password') as string} className={inputClass} {...register('password')} />
        <input
          type="password"
          placeholder={t('auth.confirmPassword') as string}
          className={inputClass}
          {...register('confirm_password')}
        />
        {(errors.first_name || errors.last_name || errors.email || errors.password) && (
          <p className="text-xs text-red-600">{t('common.required')}</p>
        )}
        {errors.confirm_password && <p className="text-xs text-red-600">Les mots de passe ne correspondent pas.</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t('common.loading') : t('auth.registerSubmit')}
        </Button>
      </form>
      <div className="mt-6 text-center text-xs text-noir/60">
        <Link href="/connexion" className="hover:text-dore-dark">
          {t('auth.hasAccount')}
        </Link>
      </div>
    </div>
  )
}
