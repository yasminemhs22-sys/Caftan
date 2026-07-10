'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Minus, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, generateOrderNumber } from '@/lib/utils'
import { Button, LinkButton } from '@/components/ui/Button'
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder'

const checkoutSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  address: z.string().min(3),
  city: z.string().min(1),
  notes: z.string().optional(),
})
type CheckoutValues = z.infer<typeof checkoutSchema>

export function PanierContent() {
  const { t, i18n } = useTranslation()
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart()
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart')
  const [orderNumber, setOrderNumber] = useState('')
  const [submitError, setSubmitError] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
  })

  async function onSubmit(values: CheckoutValues) {
    setSubmitError(false)
    const supabase = createClient()
    const order_number = generateOrderNumber()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const orderId = crypto.randomUUID()

    const { error } = await supabase.from('orders').insert({
      id: orderId,
      order_number,
      user_id: user?.id || null,
      customer_first_name: values.first_name,
      customer_last_name: values.last_name,
      customer_email: values.email,
      customer_phone: values.phone,
      shipping_address: values.address,
      shipping_city: values.city,
      payment_method: 'cod',
      notes: values.notes || null,
      subtotal,
      shipping_cost: 0,
      total: subtotal,
    })

    if (error) {
      setSubmitError(true)
      return
    }

    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.name,
      color: item.color || null,
      size: item.size || null,
      unit_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))
    await supabase.from('order_items').insert(orderItems)

    setOrderNumber(order_number)
    clearCart()
    setStep('success')
  }

  const inputClass =
    'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'

  if (step === 'success') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 pb-24 pt-32 text-center md:pt-40">
        <CheckCircle2 size={52} strokeWidth={1} className="mb-6 text-dore" />
        <h1 className="font-display text-2xl text-noir">{t('checkout.orderSuccess')}</h1>
        <p className="mt-3 text-sm text-noir/60">{t('checkout.orderSuccessDetail')}</p>
        <p className="mt-4 text-sm text-noir">
          {t('checkout.orderNumber')} : <span className="text-dore-dark">{orderNumber}</span>
        </p>
        <LinkButton href="/boutique" variant="primary" className="mt-8">{t('checkout.backToShop')}</LinkButton>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 pb-24 pt-32 text-center md:pt-40">
        <h1 className="font-display text-2xl text-noir">{t('cart.title')}</h1>
        <p className="mt-3 text-sm text-noir/60">{t('cart.empty')}</p>
        <LinkButton href="/boutique" variant="primary" className="mt-8">{t('cart.startShopping')}</LinkButton>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <h1 className="mb-10 font-display text-3xl text-noir">{step === 'cart' ? t('cart.title') : t('checkout.title')}</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 'cart' ? (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-4 border-b border-noir/10 pb-6">
                  <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-noir">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <ProductImagePlaceholder />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link href={`/produit/${item.slug}`} className="font-display text-sm text-noir hover:text-dore-dark">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-noir/50">
                        {[item.color, item.size].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-noir/20">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color, item.size)}
                          className="p-2"
                          aria-label="-"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color, item.size)}
                          className="p-2"
                          aria-label="+"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm text-noir">
                        {formatPrice(item.price * item.quantity, t('common.currency') as string, i18n.language)}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId, item.color, item.size)}
                        aria-label={t('cart.remove') as string}
                        className="text-noir/40 hover:text-red-600"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h2 className="mb-2 text-xs uppercase tracking-widest2 text-noir/50">{t('checkout.shippingInfo')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <input placeholder={t('checkout.firstName') as string} className={inputClass} {...register('first_name')} />
                  {errors.first_name && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
                </div>
                <div>
                  <input placeholder={t('checkout.lastName') as string} className={inputClass} {...register('last_name')} />
                  {errors.last_name && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
                </div>
                <div>
                  <input placeholder={t('checkout.phone') as string} className={inputClass} {...register('phone')} />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
                </div>
                <div>
                  <input placeholder={t('checkout.email') as string} className={inputClass} {...register('email')} />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{t('common.invalidEmail')}</p>}
                </div>
                <div className="sm:col-span-2">
                  <input placeholder={t('checkout.address') as string} className={inputClass} {...register('address')} />
                  {errors.address && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
                </div>
                <div>
                  <input placeholder={t('checkout.city') as string} className={inputClass} {...register('city')} />
                  {errors.city && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
                </div>
                <div className="sm:col-span-2">
                  <textarea placeholder={t('checkout.notes') as string} rows={3} className={inputClass} {...register('notes')} />
                </div>
              </div>

              <p className="pt-4 text-xs text-noir/40">{t('checkout.codOnlyNote')}</p>

              {submitError && <p className="text-xs text-red-600">{t('inquiryForm.error')}</p>}
            </form>
          )}
        </div>

        <div className="h-fit border border-noir/10 p-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-noir/60">{t('cart.subtotal')}</span>
              <span>{formatPrice(subtotal, t('common.currency') as string, i18n.language)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-noir/60">{t('cart.shipping')}</span>
              <span className="text-xs text-noir/40">{t('cart.shippingNote')}</span>
            </div>
            <div className="flex justify-between border-t border-noir/10 pt-3 text-base">
              <span>{t('cart.total')}</span>
              <span className="text-dore-dark">{formatPrice(subtotal, t('common.currency') as string, i18n.language)}</span>
            </div>
          </div>

          {step === 'cart' ? (
            <Button onClick={() => setStep('checkout')} className="mt-6 w-full">
              {t('cart.checkout')}
            </Button>
          ) : (
            <Button type="submit" form="checkout-form" disabled={isSubmitting} className="mt-6 w-full">
              {isSubmitting ? t('common.loading') : t('checkout.placeOrder')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}