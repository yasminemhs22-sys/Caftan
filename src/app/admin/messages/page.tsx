import { createClient } from '@/lib/supabase/server'
import { MessagesTable } from '@/components/shop/MessagesTable'
import type { Message } from '@/types'

export default async function AdminMessagesPage() {
  const supabase = createClient()
  const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl text-noir">Messages</h1>
      <MessagesTable messages={(data as Message[]) || []} />
    </div>
  )
}
