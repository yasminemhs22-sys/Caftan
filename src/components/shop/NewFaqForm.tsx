'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'

export function NewFaqForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    question_fr: '',
    question_en: '',
    question_ar: '',
    answer_fr: '',
    answer_en: '',
    answer_ar: '',
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
      const { error: insertError } = await supabase.from('faq').insert({
        question: { fr: form.question_fr, en: form.question_en, ar: form.question_ar },
        answer: { fr: form.answer_fr, en: form.answer_en, ar: form.answer_ar },
      })
      if (insertError) throw new Error(insertError.message)
      router.push('/admin/faq')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Question</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            placeholder="Français"
            className={inputClass}
            value={form.question_fr}
            onChange={(e) => update('question_fr', e.target.value)}
            required
          />
          <input placeholder="English" className={inputClass} value={form.question_en} onChange={(e) => update('question_en', e.target.value)} />
          <input
            placeholder="العربية"
            dir="rtl"
            className={inputClass}
            value={form.question_ar}
            onChange={(e) => update('question_ar', e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Réponse</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <textarea
            placeholder="Français"
            rows={4}
            className={inputClass}
            value={form.answer_fr}
            onChange={(e) => update('answer_fr', e.target.value)}
            required
          />
          <textarea
            placeholder="English"
            rows={4}
            className={inputClass}
            value={form.answer_en}
            onChange={(e) => update('answer_en', e.target.value)}
          />
          <textarea
            placeholder="العربية"
            dir="rtl"
            rows={4}
            className={inputClass}
            value={form.answer_ar}
            onChange={(e) => update('answer_ar', e.target.value)}
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-noir px-7 py-3 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Créer la question'}
      </button>
    </form>
  )
}
