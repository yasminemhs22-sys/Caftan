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

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
type FormValues = z.infer<typeof schema>

export default function ConnexionPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setError(null)
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword(values)
    if (authError || !data.user) {
      setError(authError?.message || 'Identifiants invalides')
      return
    }

    const { data: admin } = await supabase.from('admins').select('id').eq('user_id', data.user.id).maybeSingle()
    router.push(admin ? '/admin' : '/')
    router.refresh()
  }

  const inputClass =
    'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-28">
      <h1 className="mb-8 text-center font-display text-2xl text-noir">{t('auth.loginTitle')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input placeholder={t('auth.email') as string} className={inputClass} {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{t('common.invalidEmail')}</p>}
        </div>
        <div>
          <input type="password" placeholder={t('auth.password') as string} className={inputClass} {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t('common.loading') : t('auth.loginSubmit')}
        </Button>
      </form>
      <div className="mt-6 flex justify-between text-xs text-noir/60">
        <Link href="/mot-de-passe-oublie" className="hover:text-dore-dark">
          {t('auth.forgotLink')}
        </Link>
        <Link href="/inscription" className="hover:text-dore-dark">
          {t('auth.noAccount')}
        </Link>
      </div>
    </div>
  )
}
