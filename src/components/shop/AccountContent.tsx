'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Heart, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button, LinkButton } from '@/components/ui/Button'
import type { Profile, Order, OrderStatus } from '@/types'

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-noir/5 text-noir/50',
  confirmed: 'bg-dore/10 text-dore-dark',
  processing: 'bg-dore/10 text-dore-dark',
  shipped: 'bg-dore/20 text-dore-dark',
  delivered: 'bg-dore text-noir',
  cancelled: 'bg-red-50 text-red-600',
}

export function AccountContent({ email, profile, orders }: { email: string; profile: Profile; orders: Order[] }) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [tab, setTab] = useState<'profile' | 'orders'>('profile')
  const [saved, setSaved] = useState(false)
  const [openOrders, setOpenOrders] = useState<Set<string>>(new Set())

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || '',
      city: profile.city || '',
      address: profile.address || '',
    },
  })

  async function onSubmit(values: FormValues) {
    setSaved(false)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update(values).eq('id', profile.id)
    if (!error) {
      setSaved(true)
      router.refresh()
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function toggleOrder(id: string) {
    setOpenOrders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const inputClass =
    'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'
  const labelClass = 'mb-1.5 block text-xs uppercase tracking-widest2 text-noir/50'

  return (
    <div>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-noir">{t('account.title')}</h1>
          <p className="mt-1 text-sm text-noir/50">{email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs uppercase tracking-widest2 text-noir/60 hover:text-dore-dark"
        >
          <LogOut size={15} strokeWidth={1.5} /> {t('account.logout')}
        </button>
      </div>

      <div className="mb-8 flex gap-6 border-b border-noir/10">
        <button
          onClick={() => setTab('profile')}
          className={`pb-3 text-xs uppercase tracking-widest2 ${tab === 'profile' ? 'border-b-2 border-dore text-noir' : 'text-noir/40'}`}
        >
          {t('account.profileTab')}
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`pb-3 text-xs uppercase tracking-widest2 ${tab === 'orders' ? 'border-b-2 border-dore text-noir' : 'text-noir/40'}`}
        >
          {t('account.ordersTab')} {orders.length > 0 && `(${orders.length})`}
        </button>
      </div>

      {tab === 'profile' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t('account.firstName')}</label>
              <input className={inputClass} {...register('first_name')} />
              {errors.first_name && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
            </div>
            <div>
              <label className={labelClass}>{t('account.lastName')}</label>
              <input className={inputClass} {...register('last_name')} />
              {errors.last_name && <p className="mt-1 text-xs text-red-600">{t('common.required')}</p>}
            </div>
            <div>
              <label className={labelClass}>{t('account.phone')}</label>
              <input className={inputClass} {...register('phone')} />
            </div>
            <div>
              <label className={labelClass}>{t('account.city')}</label>
              <input className={inputClass} {...register('city')} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>{t('account.address')}</label>
              <input className={inputClass} {...register('address')} />
            </div>
          </div>

          {saved && <p className="text-xs text-dore-dark">{t('account.saved')}</p>}

          <div className="flex items-center gap-5 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('account.save')}
            </Button>
            <LinkButton href="/favoris" variant="ghost">
              <Heart size={14} strokeWidth={1.5} /> {t('account.viewWishlist')}
            </LinkButton>
          </div>
        </form>
      ) : orders.length === 0 ? (
        <p className="py-10 text-sm text-noir/50">{t('account.noOrders')}</p>
      ) : (
        <div className="divide-y divide-noir/10 border-y border-noir/10">
          {orders.map((order) => {
            const isOpen = openOrders.has(order.id)
            return (
              <div key={order.id}>
                <button
                  onClick={() => toggleOrder(order.id)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-start"
                  aria-expanded={isOpen}
                >
                  <div>
                    <p className="text-sm text-noir">
                      {t('account.orderNumber')} <span className="text-dore-dark">{order.order_number}</span>
                    </p>
                    <p className="mt-1 text-xs text-noir/40">{formatDate(order.created_at, i18n.language)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest2 ${STATUS_STYLES[order.status]}`}>
                      {t(`account.status.${order.status}`)}
                    </span>
                    {order.payment_method === 'online' && (
                      <span
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-widest2 ${
                          order.payment_status === 'paid'
                            ? 'bg-dore/10 text-dore-dark'
                            : order.payment_status === 'failed'
                              ? 'bg-red-50 text-red-600'
                              : 'bg-noir/5 text-noir/50'
                        }`}
                      >
                        {t(`account.paymentStatus.${order.payment_status}`)}
                      </span>
                    )}
                    <span className="text-sm text-noir">
                      {formatPrice(order.total, t('common.currency') as string, i18n.language)}
                    </span>
                    <ChevronDown
                      size={16}
                      strokeWidth={1.5}
                      className={`shrink-0 text-noir/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
                {isOpen && (
                  <div className="space-y-2 pb-5">
                    {(order.order_items || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm text-noir/60">
                        <span>
                          {item.product_name}
                          {(item.color || item.size) && (
                            <span className="text-noir/40"> — {[item.color, item.size].filter(Boolean).join(' · ')}</span>
                          )}
                          {' '}× {item.quantity}
                        </span>
                        <span>{formatPrice(item.subtotal, t('common.currency') as string, i18n.language)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
