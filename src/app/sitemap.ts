import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lacasadelcaftan.com'
  const supabase = createClient()

  const staticRoutes = ['', '/boutique', '/collections', '/nouveautes', '/promotions', '/a-propos', '/contact', '/faq'].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }))

  const [{ data: products }, { data: collections }] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('is_active', true),
    supabase.from('collections').select('slug, updated_at').eq('is_active', true),
  ])

  const productRoutes = (products || []).map((p) => ({
    url: `${siteUrl}/produit/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }))

  const collectionRoutes = (collections || []).map((c) => ({
    url: `${siteUrl}/collections/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
  }))

  return [...staticRoutes, ...productRoutes, ...collectionRoutes]
}
