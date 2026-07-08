'use client'

import { useState } from 'react'
import { Star, Check, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalized, formatDate } from '@/lib/utils'
import type { Review, LocalizedText } from '@/types'

export interface ReviewWithProduct extends Review {
  products: { name: LocalizedText; slug: string } | null
}

export function ReviewsTable({ reviews: initialReviews }: { reviews: ReviewWithProduct[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleApprove(review: ReviewWithProduct) {
    setBusyId(review.id)
    const supabase = createClient()
    const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', review.id)
    if (!error) {
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, is_approved: true } : r)))
    }
    setBusyId(null)
  }

  async function handleDelete(review: ReviewWithProduct) {
    if (!confirm('Supprimer cet avis ? Cette action est irréversible.')) return
    setBusyId(review.id)
    const supabase = createClient()
    const { error } = await supabase.from('reviews').delete().eq('id', review.id)
    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== review.id))
    }
    setBusyId(null)
  }

  if (!reviews.length) {
    return <p className="text-sm text-noir/50">Aucun avis pour le moment.</p>
  }

  const pending = reviews.filter((r) => !r.is_approved)
  const approved = reviews.filter((r) => r.is_approved)

  function ReviewRow({ review }: { review: ReviewWithProduct }) {
    return (
      <div className="flex items-start justify-between gap-4 border-b border-noir/5 p-4 last:border-0">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm text-noir">{review.customer_name}</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < review.rating ? 'fill-dore text-dore' : 'text-noir/15'} />
              ))}
            </div>
          </div>
          {review.comment && <p className="text-sm text-noir/60">{review.comment}</p>}
          <p className="mt-1 text-xs text-noir/40">
            {review.products ? getLocalized(review.products.name, 'fr') : 'Produit supprimé'} ·{' '}
            {formatDate(review.created_at, 'fr')}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {!review.is_approved && (
            <button
              onClick={() => handleApprove(review)}
              disabled={busyId === review.id}
              className="flex items-center gap-1.5 bg-dore/10 px-2.5 py-1.5 text-xs uppercase tracking-widest2 text-dore-dark hover:bg-dore/20"
            >
              <Check size={13} /> Approuver
            </button>
          )}
          <button
            onClick={() => handleDelete(review)}
            disabled={busyId === review.id}
            aria-label="Supprimer"
            className="text-noir/40 hover:text-red-600"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {pending.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs uppercase tracking-widest2 text-dore-dark">En attente d'approbation ({pending.length})</h2>
          <div className="border border-noir/10 bg-white">
            {pending.map((r) => (
              <ReviewRow key={r.id} review={r} />
            ))}
          </div>
        </div>
      )}
      <div>
        <h2 className="mb-3 text-xs uppercase tracking-widest2 text-noir/50">Publiés ({approved.length})</h2>
        {approved.length === 0 ? (
          <p className="text-sm text-noir/50">Aucun avis publié pour le moment.</p>
        ) : (
          <div className="border border-noir/10 bg-white">
            {approved.map((r) => (
              <ReviewRow key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
