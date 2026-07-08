import { createClient } from '@/lib/supabase/server'
import { ReviewsTable, type ReviewWithProduct } from '@/components/shop/ReviewsTable'

export default async function AdminAvisPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('reviews')
    .select('*, products(name, slug)')
    .order('is_approved', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl text-noir">Avis clients</h1>
      <ReviewsTable reviews={(data as ReviewWithProduct[]) || []} />
    </div>
  )
}
