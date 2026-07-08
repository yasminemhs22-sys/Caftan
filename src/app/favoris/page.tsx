import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FavorisContent } from '@/components/shop/FavorisContent'

export const metadata: Metadata = {
  title: 'Mes favoris',
  robots: { index: false, follow: false },
}

export default async function FavorisPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  return <FavorisContent />
}
