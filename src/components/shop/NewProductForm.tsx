'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

const inputClass =
  'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'
const labelClass = 'mb-1.5 block text-xs uppercase tracking-widest2 text-noir/50'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])

  const [form, setForm] = useState({
    name_fr: '',
    name_en: '',
    name_ar: '',
    description_fr: '',
    description_en: '',
    description_ar: '',
    sku: '',
    price: '',
    promo_price: '',
    category_id: categories[0]?.id || '',
    colors: '',
    sizes: '',
    stock_quantity: '0',
    is_featured: false,
    is_new: false,
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
      const slug = slugify(form.name_fr) || `produit-${Date.now()}`

      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert({
          sku: form.sku || `SKU-${Date.now()}`,
          slug,
          name: { fr: form.name_fr, en: form.name_en, ar: form.name_ar },
          description: { fr: form.description_fr, en: form.description_en, ar: form.description_ar },
          price: Number(form.price) || 0,
          promo_price: form.promo_price ? Number(form.promo_price) : null,
          category_id: form.category_id || null,
          colors: form.colors ? form.colors.split(',').map((c) => c.trim()).filter(Boolean) : [],
          sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
          stock_quantity: Number(form.stock_quantity) || 0,
          is_featured: form.is_featured,
          is_new: form.is_new,
        })
        .select()
        .single()

      if (insertError || !product) throw new Error(insertError?.message || 'Erreur lors de la création du produit')

      // Upload des images vers le bucket "product-images", puis insertion des lignes product_images
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const path = `${product.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file)
        if (uploadError) continue

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        await supabase.from('product_images').insert({
          product_id: product.id,
          url: urlData.publicUrl,
          display_order: i,
          is_primary: i === 0,
        })
      }

      router.push('/admin/produits')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Nom du produit</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input placeholder="Français" className={inputClass} value={form.name_fr} onChange={(e) => update('name_fr', e.target.value)} required />
          <input placeholder="English" className={inputClass} value={form.name_en} onChange={(e) => update('name_en', e.target.value)} />
          <input placeholder="العربية" dir="rtl" className={inputClass} value={form.name_ar} onChange={(e) => update('name_ar', e.target.value)} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest2 text-dore">Description</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <textarea placeholder="Français" rows={3} className={inputClass} value={form.description_fr} onChange={(e) => update('description_fr', e.target.value)} />
          <textarea placeholder="English" rows={3} className={inputClass} value={form.description_en} onChange={(e) => update('description_en', e.target.value)} />
          <textarea placeholder="العربية" dir="rtl" rows={3} className={inputClass} value={form.description_ar} onChange={(e) => update('description_ar', e.target.value)} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>SKU (référence)</label>
          <input placeholder="Auto-généré si vide" className={inputClass} value={form.sku} onChange={(e) => update('sku', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Catégorie</label>
          <select className={inputClass} value={form.category_id} onChange={(e) => update('category_id', e.target.value)}>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name.fr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Prix (DA)</label>
          <input type="number" className={inputClass} value={form.price} onChange={(e) => update('price', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Prix promo (optionnel)</label>
          <input type="number" className={inputClass} value={form.promo_price} onChange={(e) => update('promo_price', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Couleurs (séparées par une virgule)</label>
          <input placeholder="Noir, Doré" className={inputClass} value={form.colors} onChange={(e) => update('colors', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Tailles (séparées par une virgule)</label>
          <input placeholder="S, M, L, XL" className={inputClass} value={form.sizes} onChange={(e) => update('sizes', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input type="number" className={inputClass} value={form.stock_quantity} onChange={(e) => update('stock_quantity', e.target.value)} />
        </div>
      </section>

      <section className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-noir/70">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} className="accent-dore" />
          Produit vedette
        </label>
        <label className="flex items-center gap-2 text-sm text-noir/70">
          <input type="checkbox" checked={form.is_new} onChange={(e) => update('is_new', e.target.checked)} className="accent-dore" />
          Nouveauté
        </label>
      </section>

      <section>
        <label className={labelClass}>Photos du produit</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block w-full text-sm text-noir/70"
        />
        <p className="mt-1.5 text-xs text-noir/40">La première photo sélectionnée devient l'image principale.</p>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-noir px-7 py-3 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Créer le produit'}
      </button>
    </form>
  )
}
