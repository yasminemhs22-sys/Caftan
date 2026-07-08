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

export function NewCollectionForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    name_fr: '',
    name_en: '',
    name_ar: '',
    description_fr: '',
    description_en: '',
    description_ar: '',
    is_featured: false,
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
      let image_url: string | null = null
      if (file) {
        const path = `collections/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('site-assets').upload(path, file)
        if (uploadError) throw new Error(uploadError.message)
        const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(path)
        image_url = urlData.publicUrl
      }

      const slug = slugify(form.name_fr) || `collection-${Date.now()}`
      const { error: insertError } = await supabase.from('collections').insert({
        slug,
        name: { fr: form.name_fr, en: form.name_en, ar: form.name_ar },
        description: { fr: form.description_fr, en: form.description_en, ar: form.description_ar },
        image_url,
        is_featured: form.is_featured,
      })
      if (insertError) throw new Error(insertError.message)
      router.push('/admin/collections')
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
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Nom de la collection</h2>
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

      <section>
        <h2 className="mb-2 text-xs uppercase tracking-widest2 text-dore">Image de couverture</h2>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-noir/70" />
      </section>

      <label className="flex items-center gap-2 text-sm text-noir/70">
        <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} className="accent-dore" />
        Mettre en avant sur l'accueil
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-noir px-7 py-3 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Créer la collection'}
      </button>
    </form>
  )
}
