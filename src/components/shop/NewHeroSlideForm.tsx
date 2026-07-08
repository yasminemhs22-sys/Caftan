'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'
const labelClass = 'mb-1.5 block text-xs uppercase tracking-widest2 text-noir/50'

export function NewHeroSlideForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title_fr: '',
    title_en: '',
    title_ar: '',
    subtitle_fr: '',
    subtitle_en: '',
    subtitle_ar: '',
    cta_text_fr: '',
    cta_text_en: '',
    cta_text_ar: '',
    cta_link: '/boutique',
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Une image est requise pour la diapositive.')
      return
    }
    setSaving(true)
    setError(null)
    const supabase = createClient()

    try {
      const path = `hero/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('site-assets').upload(path, file)
      if (uploadError) throw new Error(uploadError.message)
      const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(path)

      const { error: insertError } = await supabase.from('hero_slides').insert({
        title: { fr: form.title_fr, en: form.title_en, ar: form.title_ar },
        subtitle: { fr: form.subtitle_fr, en: form.subtitle_en, ar: form.subtitle_ar },
        cta_text: { fr: form.cta_text_fr, en: form.cta_text_en, ar: form.cta_text_ar },
        cta_link: form.cta_link || '/boutique',
        image_url: urlData.publicUrl,
      })
      if (insertError) throw new Error(insertError.message)
      router.push('/admin/hero')
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
        <label className={labelClass}>Image de fond (grand format, paysage recommandé)</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-noir/70" required />
      </section>

      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Titre</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input placeholder="Français" className={inputClass} value={form.title_fr} onChange={(e) => update('title_fr', e.target.value)} required />
          <input placeholder="English" className={inputClass} value={form.title_en} onChange={(e) => update('title_en', e.target.value)} />
          <input placeholder="العربية" dir="rtl" className={inputClass} value={form.title_ar} onChange={(e) => update('title_ar', e.target.value)} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Sous-titre (optionnel)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input placeholder="Français" className={inputClass} value={form.subtitle_fr} onChange={(e) => update('subtitle_fr', e.target.value)} />
          <input placeholder="English" className={inputClass} value={form.subtitle_en} onChange={(e) => update('subtitle_en', e.target.value)} />
          <input placeholder="العربية" dir="rtl" className={inputClass} value={form.subtitle_ar} onChange={(e) => update('subtitle_ar', e.target.value)} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Bouton (optionnel — "Découvrir" par défaut)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input placeholder="Français" className={inputClass} value={form.cta_text_fr} onChange={(e) => update('cta_text_fr', e.target.value)} />
          <input placeholder="English" className={inputClass} value={form.cta_text_en} onChange={(e) => update('cta_text_en', e.target.value)} />
          <input placeholder="العربية" dir="rtl" className={inputClass} value={form.cta_text_ar} onChange={(e) => update('cta_text_ar', e.target.value)} />
        </div>
        <div className="mt-4">
          <label className={labelClass}>Lien du bouton</label>
          <input placeholder="/boutique" className={inputClass} value={form.cta_link} onChange={(e) => update('cta_link', e.target.value)} />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-noir px-7 py-3 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Créer la diapositive'}
      </button>
    </form>
  )
}
