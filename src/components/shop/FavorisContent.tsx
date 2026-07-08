'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { useWishlist } from '@/context/WishlistContext'
import { ProductCard } from '@/components/shop/ProductCard'
import { LinkButton } from '@/components/ui/Button'
import type { Product } from '@/types'

export function FavorisContent() {
  const { t } = useTranslation()
  const { ids, loading: wishlistLoading } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    if (wishlistLoading) return

    if (ids.size === 0) {
      setProducts([])
      setLoadingProducts(false)
      return
    }

    let active = true
    setLoadingProducts(true)
    const supabase = createClient()
    supabase
      .from('products')
      .select('*, product_images(*)')
      .in('id', Array.from(ids))
      .then(({ data }) => {
        if (active) {
          setProducts((data as Product[]) || [])
          setLoadingProducts(false)
        }
      })

    return () => {
      active = false
    }
  }, [ids, wishlistLoading])

  const loading = wishlistLoading || loadingProducts

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <h1 className="mb-10 font-display text-3xl text-noir">{t('favoris.title')}</h1>

      {loading ? (
        <p className="py-20 text-center text-sm text-noir/50">{t('common.loading')}</p>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="mb-6 text-sm text-noir/50">{t('favoris.empty')}</p>
          <LinkButton href="/boutique" variant="primary">
            {t('favoris.browseShop')}
          </LinkButton>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
