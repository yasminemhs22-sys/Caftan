'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Category, Product } from '@/types'

const inputClass =
  'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'
const labelClass = 'mb-1.5 block text-xs uppercase tracking-widest2 text-noir/50'

export function EditProductForm({ product, categories }: { product: Product; categories: Category[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [images, setImages] = useState(product.product_images || [])
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name_fr: product.name?.fr || '',
    name_en: product.name?.en || '',
    name_ar: product.name?.ar || '',
    description_fr: product.description?.fr || '',
    description_en: product.description?.en || '',
    description_ar: product.description?.ar || '',
    sku: product.sku || '',
    price: String(product.price ?? ''),
    promo_price: product.promo_price != null ? String(product.promo_price) : '',
    category_id: product.category_id || categories[0]?.id || '',
    colors: (product.colors || []).join(', '),
    sizes: (product.sizes || []).join(', '),
    stock_quantity: String(product.stock_quantity ?? '0'),
    is_featured: !!product.is_featured,
    is_new: !!product.is_new,
    is_active: !!product.is_active,
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm('Supprimer cette photo ?')) return
    setDeletingImageId(imageId)
    const supabase = createClient()
    const { error: deleteError } = await supabase.from('product_images').delete().eq('id', imageId)
    if (!deleteError) {
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    }
    setDeletingImageId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: { fr: form.name_fr, en: form.name_en, ar: form.name_ar },
          description: { fr: form.description_fr, en: form.description_en, ar: form.description_ar },
          sku: form.sku,
          price: Number(form.price) || 0,
          promo_price: form.promo_price ? Number(form.promo_price) : null,
          category_id: form.category_id || null,
          colors: form.colors ? form.colors.split(',').map((c) => c.trim()).filter(Boolean) : [],
          sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
          stock_quantity: Number(form.stock_quantity) || 0,
          is_featured: form.is_featured,
          is_new: form.is_new,
          is_active: form.is_active,
        })
        .eq('id', product.id)

      if (updateError) throw new Error(updateError.message)

      const startOrder = images.length
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const path = `${product.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file)
        if (uploadError) continue

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        await supabase.from('product_images').insert({
          product_id: product.id,
          url: urlData.publicUrl,
          display_order: startOrder + i,
          is_primary: images.length === 0 && i === 0,
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
          <input className={inputClass} value={form.sku} onChange={(e) => update('sku', e.target.value)} />
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
          <input className={inputClass} value={form.colors} onChange={(e) => update('colors', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Tailles (séparées par une virgule)</label>
          <input className={inputClass} value={form.sizes} onChange={(e) => update('sizes', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input type="number" className={inputClass} value={form.stock_quantity} onChange={(e) => update('stock_quantity', e.target.value)} />
        </div>
      </section>

      <section className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-noir/70">
          <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="accent-dore" />
          Actif (visible sur le site)
        </label>
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
        <label className={labelClass}>Photos actuelles</label>
        {images.length === 0 ? (
          <p className="text-sm text-noir/40">Aucune photo pour le moment.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden border border-noir/10">
                <Image src={img.url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.id)}
                  disabled={deletingImageId === img.id}
                  aria-label="Supprimer cette photo"
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-noir/60 text-white"
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
                {img.is_primary && (
                  <span className="absolute bottom-1.5 left-1.5 bg-dore px-1.5 py-0.5 text-[9px] uppercase tracking-widest2 text-noir">
                    Principale
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <label className={cn(labelClass, 'mt-5 block')}>Ajouter de nouvelles photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block w-full text-sm text-noir/70"
        />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-noir px-7 py-3 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </button>
    </form>
  )
}
