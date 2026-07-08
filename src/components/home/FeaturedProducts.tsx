'use client'

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ProductCard } from '@/components/shop/ProductCard'
import { LinkButton } from '@/components/ui/Button'
import type { Product } from '@/types'

export function FeaturedProducts({
  titleKey,
  products,
  viewAllHref = '/boutique',
}: {
  titleKey: string
  products: Product[]
  viewAllHref?: string
}) {
  const { t } = useTranslation()

  if (!products.length) return null

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
      <div className="mb-10 flex items-end justify-between">
        <h2 className="font-display text-2xl text-noir md:text-3xl">{t(titleKey)}</h2>
        <LinkButton href={viewAllHref} variant="ghost" className="hidden px-0 py-0 md:inline-flex">
          {t('common.seeAll')}
        </LinkButton>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      <div className="mt-10 text-center md:hidden">
        <LinkButton href={viewAllHref} variant="outline">
          {t('common.seeAll')}
        </LinkButton>
      </div>
    </section>
  )
}
