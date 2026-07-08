import { createClient } from '@/lib/supabase/server'
import { SettingsTabs } from '@/components/shop/SettingsTabs'

export default async function AdminReglagesPage() {
  const supabase = createClient()
  const [{ data: settings }, { data: contactInfo }, { data: seo }] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 1).single(),
    supabase.from('contact_info').select('*').eq('id', 1).single(),
    supabase.from('seo').select('*').eq('page_slug', 'global').single(),
  ])

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl text-noir">Réglages</h1>
      <SettingsTabs settings={settings} contactInfo={contactInfo} seo={seo} />
    </div>
  )
}
