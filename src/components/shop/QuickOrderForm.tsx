'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, generateOrderNumber } from '@/lib/utils'
import { WILAYAS } from '@/lib/wilayas'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types'

const inputClass =
  'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'

interface Props {
  product: Product
  color?: string
  size?: string
  quantity: number
}

export function QuickOrderForm({ product, color, size, quantity }: Props) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [commune, setCommune] = useState('')
  const [deliveryType, setDeliveryType] = useState<'bureau' | 'domicile'>('domicile')
  const [wilayaSearch, setWilayaSearch] = useState('')
  const [wilayaCode, setWilayaCode] = useState('')
  const [showWilayaList, setShowWilayaList] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  const selectedWilaya = WILAYAS.find((w) => w.code === wilayaCode)
  const shippingCost = 0
  const unitPrice = product.promo_price ?? product.price
  const subtotal = unitPrice * quantity
  const total = subtotal + shippingCost

  const filteredWilayas =
    wilayaSearch.trim().length > 0
      ? WILAYAS.filter((w) => w.name.toLowerCase().includes(wilayaSearch.toLowerCase())).slice(0, 8)
      : WILAYAS.slice(0, 8)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!wilayaCode) {
      setError(t('product.selectWilayaError') as string)
      return
    }
    setSubmitting(true)
    setError(null)
    const supabase = createClient()
    const order_number = generateOrderNumber()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number,
          user_id: user?.id || null,
          customer_first_name: firstName,
          customer_last_name: lastName,
          customer_email: user?.email || 'commande-directe@sans-email.local',
          customer_phone: phone,
          shipping_address: commune,
          shipping_city: selectedWilaya?.name || '',
          shipping_wilaya: selectedWilaya?.name || '',
          shipping_commune: commune,
          delivery_type: deliveryType,
          payment_method: 'cod',
          subtotal,
          shipping_cost: shippingCost,
          total,
        })
        .select()
        .single()

      if (orderError || !order) throw new Error(orderError?.message || 'Erreur lors de la commande.')

      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name.fr || Object.values(product.name)[0] || '',
        color: color || null,
        size: size || null,
        unit_price: unitPrice,
        quantity,
        subtotal,
      })

      setOrderNumber(order_number)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  if (orderNumber) {
    return (
      <div className="border border-dore/40 bg-dore/5 p-6 text-center">
        <CheckCircle2 size={40} strokeWidth={1} className="mx-auto mb-3 text-dore" />
        <p className="font-display text-lg text-noir">{t('checkout.orderSuccess')}</p>
        <p className="mt-2 text-sm text-noir/60">{t('checkout.orderSuccessDetail')}</p>
        <p className="mt-3 text-sm text-noir">
          {t('checkout.orderNumber')} : <span className="text-dore-dark">{orderNumber}</span>
        </p>
      </div>
    )
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        {t('product.orderNow')}
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-noir/10 p-5">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder={t('checkout.firstName') as string} className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <input placeholder={t('checkout.lastName') as string} className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>

      <input placeholder={t('checkout.phone') as string} className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} required />

      <div className="relative">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-noir/30" />
          <input
            placeholder={t('product.searchWilaya') as string}
            className={inputClass + ' ps-9'}
            value={selectedWilaya ? selectedWilaya.name : wilayaSearch}
            onChange={(e) => {
              setWilayaSearch(e.target.value)
              setWilayaCode('')
              setShowWilayaList(true)
            }}
            onFocus={() => setShowWilayaList(true)}
            required
          />
        </div>
        {showWilayaList && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto border border-noir/15 bg-white shadow-lg">
            {filteredWilayas.length === 0 ? (
              <p className="p-3 text-xs text-noir/40">{t('product.noWilayaFound')}</p>
            ) : (
              filteredWilayas.map((w) => (
                <button
                  key={w.code}
                  type="button"
                  onClick={() => {
                    setWilayaCode(w.code)
                    setWilayaSearch('')
                    setShowWilayaList(false)
                  }}
                  className="block w-full px-3.5 py-2 text-start text-sm hover:bg-dore/5"
                >
                  {w.code} — {w.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <input placeholder={t('product.commune') as string} className={inputClass} value={commune} onChange={(e) => setCommune(e.target.value)} required />

      <div>
        <p className="mb-1.5 text-xs uppercase tracking-widest2 text-noir/50">{t('product.deliveryType')}</p>
        <div className="flex gap-2">
          <label className={`flex-1 cursor-pointer border px-3 py-2.5 text-center text-sm ${deliveryType === 'domicile' ? 'border-noir bg-noir text-dore' : 'border-noir/20 text-noir/70'}`}>
            <input type="radio" className="hidden" checked={deliveryType === 'domicile'} onChange={() => setDeliveryType('domicile')} />
            {t('product.domicile')}
          </label>
          <label className={`flex-1 cursor-pointer border px-3 py-2.5 text-center text-sm ${deliveryType === 'bureau' ? 'border-noir bg-noir text-dore' : 'border-noir/20 text-noir/70'}`}>
            <input type="radio" className="hidden" checked={deliveryType === 'bureau'} onChange={() => setDeliveryType('bureau')} />
            {t('product.bureau')}
          </label>
        </div>
      </div>

      <div className="space-y-1 border-t border-noir/10 pt-3 text-sm">
        <div className="flex justify-between text-noir/60">
          <span>{t('cart.subtotal')}</span>
          <span>{formatPrice(subtotal, t('common.currency') as string, i18n.language)}</span>
        </div>
        <div className="flex justify-between text-noir/60">
          <span>{t('product.shippingCost')}</span>
          <span>{wilayaCode ? formatPrice(shippingCost, t('common.currency') as string, i18n.language) : '—'}</span>
        </div>
        <div className="flex justify-between text-base text-noir">
          <span>{t('cart.total')}</span>
          <span className="text-dore-dark">{formatPrice(total, t('common.currency') as string, i18n.language)}</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? t('common.loading') : t('product.confirmOrder')}
      </Button>
    </form>
  )
}