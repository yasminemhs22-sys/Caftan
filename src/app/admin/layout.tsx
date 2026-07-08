import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/shop/AdminSidebar'

export const metadata = { title: 'Dashboard Admin', robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: admin } = await supabase.from('admins').select('role').eq('user_id', user.id).maybeSingle()
  if (!admin) redirect('/')

  return (
    <div className="flex min-h-screen bg-creme">
      <AdminSidebar role={admin.role} />
      <div className="flex-1 px-6 py-10 md:px-10">{children}</div>
    </div>
  )
}
