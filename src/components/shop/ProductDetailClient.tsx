'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Share2, Heart, Minus, Plus, Star } from 'lucide-react'
import { getLocalized, formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder'
import { ProductCard } from '@/components/shop/ProductCard'
import { InquiryForm } from '@/components/shop/InquiryForm'
import { ReviewForm } from '@/components/shop/ReviewForm'
import { QuickOrderForm } from '@/components/shop/QuickOrderForm'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types'

interface Props {
  product: Product
  similarProducts: Product[]
  reviews: { id: string; customer_name: string; rating: number; comment: string | null }[]
}

export function ProductDetailClient({ product, similarProducts, reviews }: Props) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { addItem } = useCart()
  const { isWishlisted, toggle } = useWishlist()
  const images = product.product_images?.length ? product.product_images : []
  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState(product.colors?.[0])
  const [size, setSize] = useState(product.sizes?.[0])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const wishlisted = isWishlisted(product.id)

  const hasPromo = product.promo_price != null && product.promo_price < product.price
  const price = hasPromo ? product.promo_price! : product.price
  const outOfStock = product.stock_quantity <= 0

  function handleAddToCart() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: getLocalized(product.name, i18n.language),
      price,
      image: images[0]?.url || null,
      color,
      size,
      quantity,
      maxStock: product.stock_quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  async function handleWishlistClick() {
    const result = await toggle(product.id)
    if (result === 'unauthenticated') router.push('/connexion')
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: getLocalized(product.name, i18n.language), url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Galerie */}
        <div>
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-noir">
            {images.length ? (
              <Image
                src={images[activeImage].url}
                alt={images[activeImage].alt_text || getLocalized(product.name, i18n.language)}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <ProductImagePlaceholder />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square overflow-hidden border ${i === activeImage ? 'border-dore' : 'border-transparent'}`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div>
          <h1 className="font-display text-2xl text-noir md:text-3xl">{getLocalized(product.name, i18n.language)}</h1>
          <p className="mt-2 text-xs uppercase tracking-widest2 text-noir/40">
            {t('product.reference')} : {product.sku}
          </p>

          <div className="mt-5 flex items-center gap-3">
            {hasPromo ? (
              <>
                <span className="text-xl text-dore-dark">{formatPrice(product.promo_price!, t('common.currency') as string, i18n.language)}</span>
                <span className="text-base text-noir/40 line-through">
                  {formatPrice(product.price, t('common.currency') as string, i18n.language)}
                </span>
              </>
            ) : (
              <span className="text-xl text-noir">{formatPrice(product.price, t('common.currency') as string, i18n.language)}</span>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-noir/70">
            {getLocalized(product.description, i18n.language)}
          </p>

          {product.colors?.length > 0 && (
            <div className="mt-7">
              <h3 className="mb-2.5 text-xs uppercase tracking-widest2 text-noir/50">{t('product.selectColor')}</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`border px-3.5 py-2 text-xs transition-colors ${
                      color === c ? 'border-dore bg-dore text-noir' : 'border-noir/20 text-noir/70 hover:border-noir/50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2.5 text-xs uppercase tracking-widest2 text-noir/50">{t('product.selectSize')}</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`border px-3.5 py-2 text-xs transition-colors ${
                      size === s ? 'border-dore bg-dore text-noir' : 'border-noir/20 text-noir/70 hover:border-noir/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex items-center gap-4">
            <div className="flex items-center border border-noir/20">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3" aria-label="-">
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 99, q + 1))}
                className="p-3"
                aria-label="+"
              >
                <Plus size={14} />
              </button>
            </div>
            <Button onClick={handleAddToCart} disabled={outOfStock} className="flex-1">
              {outOfStock ? t('common.outOfStock') : added ? '✓' : t('common.addToCart')}
            </Button>
            <button onClick={handleShare} aria-label={t('product.share') as string} className="p-3 text-noir/60 hover:text-dore-dark">
              <Share2 size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleWishlistClick}
              aria-label={(wishlisted ? t('product.removeFromWishlist') : t('product.addToWishlist')) as string}
              aria-pressed={wishlisted}
              className="p-3 text-noir/60 hover:text-dore-dark"
            >
              <Heart size={18} strokeWidth={1.5} className={wishlisted ? 'fill-dore-dark text-dore-dark' : ''} />
            </button>
          </div>

          <p className="mt-4 text-xs text-noir/50">
            {outOfStock ? t('common.outOfStock') : `${t('common.inStock')} (${product.stock_quantity})`}
          </p>
          {!outOfStock && (
  <div className="mt-5">
    <QuickOrderForm product={product} color={color} size={size} quantity={quantity} />
  </div>
)}
        </div>
      </div>

      {/* Formulaire de demande */}
      <div className="mt-20 border-t border-noir/10 pt-14">
        <h2 className="mb-2 font-display text-xl text-noir">{t('inquiryForm.title')}</h2>
        <p className="mb-6 text-sm text-noir/60">{t('inquiryForm.subtitle')}</p>
        <div className="max-w-2xl">
          <InquiryForm productId={product.id} />
        </div>
      </div>

      {/* Avis */}
      <div className="mt-20 border-t border-noir/10 pt-14">
        <h2 className="mb-6 font-display text-xl text-noir">{t('product.reviews')}</h2>
        {reviews.length ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-noir/10 pb-6">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm text-noir">{review.customer_name}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < review.rating ? 'fill-dore text-dore' : 'text-noir/20'}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-sm text-noir/60">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-noir/50">{t('product.noReviews')}</p>
        )}

        <div className="mt-8 max-w-lg">
          <ReviewForm productId={product.id} />
        </div>
      </div>

      {/* Produits similaires */}
      {similarProducts.length > 0 && (
        <div className="mt-20 border-t border-noir/10 pt-14">
          <h2 className="mb-8 font-display text-xl text-noir">{t('product.similarProducts')}</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
