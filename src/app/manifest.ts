import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const supabase = createClient()
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single()

  const iconUrl = settings?.favicon_url || settings?.logo_url || '/images/logo.jpg'
  const isDefaultLogo = iconUrl === '/images/logo.jpg'

  return {
    name: settings?.site_name || 'La Casa Del Caftan',
    short_name: settings?.site_name || 'La Casa Del Caftan',
    description: 'L’élégance du caftan, réinventée.',
    start_url: '/',
    display: 'standalone',
    background_color: settings?.primary_color || '#0A0A0A',
    theme_color: settings?.accent_color || '#D4AF37',
    icons: [
      {
        src: iconUrl,
        // Dimensions connues uniquement pour le logo par défaut fourni ;
        // "any" pour un logo/favicon personnalisé dont on ignore la taille exacte.
        sizes: isDefaultLogo ? '1408x768' : 'any',
        type: isDefaultLogo ? 'image/jpeg' : 'image/png',
        purpose: 'any',
      },
    ],
  }
}
