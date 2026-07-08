'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'

export function NewGalleryImageForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({ caption_fr: '', caption_en: '', caption_ar: '' })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Choisissez une image.')
      return
    }
    setSaving(true)
    setError(null)
    const supabase = createClient()

    try {
      const path = `${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('gallery-images').upload(path, file)
      if (uploadError) throw new Error(uploadError.message)
      const { data: urlData } = supabase.storage.from('gallery-images').getPublicUrl(path)

      const { error: insertError } = await supabase.from('gallery').insert({
        image_url: urlData.publicUrl,
        caption: { fr: form.caption_fr, en: form.caption_en, ar: form.caption_ar },
      })
      if (insertError) throw new Error(insertError.message)
      router.push('/admin/galerie')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-8">
      <section>
        <label className="mb-1.5 block text-xs uppercase tracking-widest2 text-noir/50">Photo</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-noir/70" required />
      </section>

      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Légende (optionnel)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input placeholder="Français" className={inputClass} value={form.caption_fr} onChange={(e) => update('caption_fr', e.target.value)} />
          <input placeholder="English" className={inputClass} value={form.caption_en} onChange={(e) => update('caption_en', e.target.value)} />
          <input placeholder="العربية" dir="rtl" className={inputClass} value={form.caption_ar} onChange={(e) => update('caption_ar', e.target.value)} />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-noir px-7 py-3 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Ajouter la photo'}
      </button>
    </form>
  )
}
