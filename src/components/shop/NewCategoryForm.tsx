'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function NewCategoryForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name_fr: '',
    name_en: '',
    name_ar: '',
    description_fr: '',
    description_en: '',
    description_ar: '',
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
      const slug = slugify(form.name_fr) || `categorie-${Date.now()}`
      const { error: insertError } = await supabase.from('categories').insert({
        slug,
        name: { fr: form.name_fr, en: form.name_en, ar: form.name_ar },
        description: { fr: form.description_fr, en: form.description_en, ar: form.description_ar },
      })
      if (insertError) throw new Error(insertError.message)
      router.push('/admin/categories')
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
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Nom de la catégorie</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            placeholder="Français"
            className={inputClass}
            value={form.name_fr}
            onChange={(e) => update('name_fr', e.target.value)}
            required
          />
          <input placeholder="English" className={inputClass} value={form.name_en} onChange={(e) => update('name_en', e.target.value)} />
          <input
            placeholder="العربية"
            dir="rtl"
            className={inputClass}
            value={form.name_ar}
            onChange={(e) => update('name_ar', e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Description (optionnel)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <textarea
            placeholder="Français"
            rows={3}
            className={inputClass}
            value={form.description_fr}
            onChange={(e) => update('description_fr', e.target.value)}
          />
          <textarea
            placeholder="English"
            rows={3}
            className={inputClass}
            value={form.description_en}
            onChange={(e) => update('description_en', e.target.value)}
          />
          <textarea
            placeholder="العربية"
            dir="rtl"
            rows={3}
            className={inputClass}
            value={form.description_ar}
            onChange={(e) => update('description_ar', e.target.value)}
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-noir px-7 py-3 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Créer la catégorie'}
      </button>
    </form>
  )
}
