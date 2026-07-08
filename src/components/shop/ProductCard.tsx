'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLocalized, formatPrice } from '@/lib/utils'
import { useWishlist } from '@/context/WishlistContext'
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder'
import type { Product } from '@/types'

export function ProductCard({ product }: { product: Product }) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { isWishlisted, toggle } = useWishlist()
  const image = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0]
  const hasPromo = product.promo_price != null && product.promo_price < product.price
  const outOfStock = product.stock_quantity <= 0
  const wishlisted = isWishlisted(product.id)

  async function handleWishlistClick() {
    const result = await toggle(product.id)
    if (result === 'unauthenticated') router.push('/connexion')
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleWishlistClick}
        aria-label={(wishlisted ? t('product.removeFromWishlist') : t('product.addToWishlist')) as string}
        aria-pressed={wishlisted}
        className="absolute end-3 top-3 z-10 rounded-full bg-noir/50 p-1.5 backdrop-blur-sm transition-colors hover:bg-noir/70"
      >
        <Heart size={15} strokeWidth={1.5} className={wishlisted ? 'fill-dore text-dore' : 'text-creme'} />
      </button>

      <Link href={`/produit/${product.slug}`} className="block">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-noir">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt_text || getLocalized(product.name, i18n.language)}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <ProductImagePlaceholder />
        )}

        <div className="absolute inset-x-0 top-0 flex justify-between p-3">
          <div className="flex flex-col gap-1.5">
            {product.is_new && (
              <span className="bg-noir/80 px-2 py-1 text-[10px] uppercase tracking-widest2 text-dore">
                {t('common.new')}
              </span>
            )}
            {hasPromo && (
              <span className="bg-dore px-2 py-1 text-[10px] uppercase tracking-widest2 text-noir">
                {t('common.promo')}
              </span>
            )}
          </div>
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-noir/60">
            <span className="text-xs uppercase tracking-widest2 text-creme">{t('common.outOfStock')}</span>
          </div>
        )}
      </div>

      <div className="mt-3.5">
        <h3 className="font-display text-sm text-noir group-hover:text-dore-dark transition-colors md:text-base">
          {getLocalized(product.name, i18n.language)}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          {hasPromo ? (
            <>
              <span className="text-sm text-dore-dark">{formatPrice(product.promo_price!, t('common.currency') as string, i18n.language)}</span>
              <span className="text-xs text-noir/40 line-through">
                {formatPrice(product.price, t('common.currency') as string, i18n.language)}
              </span>
            </>
          ) : (
            <span className="text-sm text-noir/80">{formatPrice(product.price, t('common.currency') as string, i18n.language)}</span>
          )}
        </div>
      </div>
      </Link>
    </div>
  )
}
