import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountContent } from '@/components/shop/AccountContent'
import type { Profile, Order } from '@/types'

export const metadata: Metadata = {
  title: 'Mon compte',
  robots: { index: false, follow: false },
}

export default async function MonComptePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <AccountContent
        email={user.email || ''}
        profile={(profile as Profile) || { id: user.id, first_name: null, last_name: null, phone: null, city: null, address: null }}
        orders={(orders as Order[]) || []}
      />
    </div>
  )
}
