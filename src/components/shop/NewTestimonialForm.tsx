'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'
const labelClass = 'mb-1.5 block text-xs uppercase tracking-widest2 text-noir/50'

export function NewTestimonialForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    customer_name: '',
    rating: 5,
    comment_fr: '',
    comment_en: '',
    comment_ar: '',
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()

    try {
      const { error: insertError } = await supabase.from('testimonials').insert({
        customer_name: form.customer_name,
        rating: form.rating,
        comment: { fr: form.comment_fr, en: form.comment_en, ar: form.comment_ar },
      })
      if (insertError) throw new Error(insertError.message)
      router.push('/admin/temoignages')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nom de la cliente</label>
          <input className={inputClass} value={form.customer_name} onChange={(e) => update('customer_name', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Note</label>
          <div className="flex items-center gap-1.5 py-2.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => update('rating', n)} aria-label={`${n} étoiles`}>
                <Star size={20} className={n <= form.rating ? 'fill-dore text-dore' : 'text-noir/20'} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Témoignage</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <textarea
            placeholder="Français"
            rows={3}
            className={inputClass}
            value={form.comment_fr}
            onChange={(e) => update('comment_fr', e.target.value)}
            required
          />
          <textarea
            placeholder="English"
            rows={3}
            className={inputClass}
            value={form.comment_en}
            onChange={(e) => update('comment_en', e.target.value)}
          />
          <textarea
            placeholder="العربية"
            dir="rtl"
            rows={3}
            className={inputClass}
            value={form.comment_ar}
            onChange={(e) => update('comment_ar', e.target.value)}
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-noir px-7 py-3 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Créer le témoignage'}
      </button>
    </form>
  )
}
