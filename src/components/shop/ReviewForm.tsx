'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'

export function ReviewForm({ productId }: { productId: string }) {
  const { t } = useTranslation()
  const [checked, setChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
      setChecked(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsAuthenticated(false)
      setStatus('idle')
      return
    }

    const { data: profile } = await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single()
    const displayName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Cliente'

    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: user.id,
      customer_name: displayName,
      rating,
      comment: comment.trim() || null,
    })

    if (error) {
      setStatus('error')
      return
    }
    setStatus('success')
  }

  // Évite un flash "connectez-vous" avant que la vérification d'auth soit terminée.
  if (!checked) return null

  if (!isAuthenticated) {
    return (
      <div className="border border-noir/10 p-5 text-sm text-noir/60">
        {t('product.loginToReview')}{' '}
        <Link href="/connexion" className="text-dore-dark underline">
          {t('nav.login')}
        </Link>
      </div>
    )
  }

  if (status === 'success') {
    return <p className="border border-dore/40 bg-dore/5 p-5 text-sm text-noir">{t('product.reviewSubmitted')}</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-noir/10 p-5">
      <h3 className="text-xs uppercase tracking-widest2 text-noir/50">{t('product.writeReview')}</h3>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} étoiles`}>
            <Star size={22} className={n <= rating ? 'fill-dore text-dore' : 'text-noir/20'} />
          </button>
        ))}
      </div>
      <textarea
        placeholder={t('product.reviewPlaceholder') as string}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className={inputClass}
      />
      {status === 'error' && <p className="text-xs text-red-600">{t('inquiryForm.error')}</p>}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-noir px-6 py-2.5 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'submitting' ? t('common.loading') : t('product.submitReview')}
      </button>
      <p className="text-xs text-noir/40">{t('product.reviewModerationNote')}</p>
    </form>
  )
}
