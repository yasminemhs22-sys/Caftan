'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, X } from 'lucide-react'
import { getLocalized } from '@/lib/utils'
import type { Category } from '@/types'

const COLORS = ['Noir', 'Blanc', 'Doré', 'Bordeaux', 'Vert', 'Bleu']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Taille unique']

interface Props {
  categories: Category[]
  current: {
    category?: string
    color?: string
    size?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    q?: string
  }
}

export function ProductFilters({ categories, current }: Props) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(current as Record<string, string>)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const sortOptions = [
    { value: 'newest', label: t('shop.newest') },
    { value: 'price_asc', label: t('shop.priceAsc') },
    { value: 'price_desc', label: t('shop.priceDesc') },
    { value: 'popularity', label: t('shop.popularity') },
  ]

  const FiltersContent = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-xs uppercase tracking-widest2 text-noir/50">{t('shop.category')}</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', current.category === cat.slug ? null : cat.slug)}
              className={`block text-sm transition-colors ${current.category === cat.slug ? 'text-dore-dark' : 'text-noir/70 hover:text-noir'}`}
            >
              {getLocalized(cat.name, i18n.language)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs uppercase tracking-widest2 text-noir/50">{t('shop.color')}</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => updateParam('color', current.color === color ? null : color)}
              className={`border px-3 py-1.5 text-xs transition-colors ${
                current.color === color ? 'border-dore bg-dore text-noir' : 'border-noir/20 text-noir/70 hover:border-noir/50'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs uppercase tracking-widest2 text-noir/50">{t('shop.size')}</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => updateParam('size', current.size === size ? null : size)}
              className={`border px-3 py-1.5 text-xs transition-colors ${
                current.size === size ? 'border-dore bg-dore text-noir' : 'border-noir/20 text-noir/70 hover:border-noir/50'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs uppercase tracking-widest2 text-noir/50">{t('shop.priceRange')}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={current.minPrice}
            onBlur={(e) => updateParam('minPrice', e.target.value || null)}
            className="w-full border border-noir/20 px-2.5 py-1.5 text-sm focus:border-dore focus:outline-none"
          />
          <span className="text-noir/40">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={current.maxPrice}
            onBlur={(e) => updateParam('maxPrice', e.target.value || null)}
            className="w-full border border-noir/20 px-2.5 py-1.5 text-sm focus:border-dore focus:outline-none"
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-noir/70">
        <input
          type="checkbox"
          checked={current.inStock === '1'}
          onChange={(e) => updateParam('inStock', e.target.checked ? '1' : null)}
          className="h-4 w-4 accent-dore"
        />
        {t('shop.inStockOnly')}
      </label>

      <button onClick={() => router.push(pathname)} className="text-xs uppercase tracking-widest2 text-noir/40 underline hover:text-noir">
        {t('shop.resetFilters')}
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile trigger */}
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 border border-noir/20 px-4 py-2 text-xs uppercase tracking-widest2"
        >
          <SlidersHorizontal size={14} /> {t('shop.filters')}
        </button>
        <select
          value={current.sort || 'newest'}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="border border-noir/20 px-3 py-2 text-xs uppercase tracking-widest2"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <h2 className="mb-6 text-xs uppercase tracking-widest2 text-noir">{t('shop.filters')}</h2>
        {FiltersContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-noir/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-80 max-w-[85vw] overflow-y-auto bg-creme p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-widest2 text-noir">{t('shop.filters')}</h2>
              <button onClick={() => setOpen(false)} aria-label={t('common.close') as string}>
                <X size={20} />
              </button>
            </div>
            {FiltersContent}
          </div>
        </div>
      )}
    </>
  )
}
