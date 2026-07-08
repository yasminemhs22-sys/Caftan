import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lacasadelcaftan.com'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/panier', '/connexion', '/inscription', '/mon-compte', '/favoris'] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
