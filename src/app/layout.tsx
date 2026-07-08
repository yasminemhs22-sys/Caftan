import type { Metadata } from 'next'
import { Playfair_Display, Inter, Amiri, Cairo } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { ThemeVars } from '@/components/ThemeVars'
import { AnalyticsScripts } from '@/components/AnalyticsScripts'
import { getSettings, getGlobalSeo, getContactInfo, getSiteContentMap } from '@/lib/settings'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const arDisplay = Amiri({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-ar-display', display: 'swap' })
const arSans = Cairo({ subsets: ['arabic'], variable: '--font-ar-sans', display: 'swap' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lacasadelcaftan.com'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, seo] = await Promise.all([getSettings(), getGlobalSeo()])

  const siteName = settings?.site_name || 'La Casa Del Caftan'
  const title = seo?.meta_title?.fr || siteName
  const description =
    seo?.meta_description?.fr ||
    "L'élégance du caftan, réinventée. Maison de mode féminine haut de gamme à Alger."
  const ogImage = seo?.og_image || settings?.logo_url || '/images/logo.jpg'
  const favicon = settings?.favicon_url || settings?.logo_url || '/icon.jpg'

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${title} — Boutique de vêtements féminins de luxe`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: ['caftan', 'robe de soirée', 'mode féminine', siteName, 'Alger', 'Algérie'],
    icons: { icon: favicon },
    openGraph: {
      title: siteName,
      description,
      url: siteUrl,
      siteName,
      images: [ogImage],
      locale: 'fr_FR',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, contactInfo, siteContent] = await Promise.all([
    getSettings(),
    getContactInfo(),
    getSiteContentMap(),
  ])

  return (
    <html lang="fr" dir="ltr" className={`${playfair.variable} ${inter.variable} ${arDisplay.variable} ${arSans.variable}`}>
      <head>
        <ThemeVars
          primaryColor={settings?.primary_color}
          secondaryColor={settings?.secondary_color}
          accentColor={settings?.accent_color}
        />
      </head>
      <body>
        <Providers>
          <Header logoUrl={settings?.logo_url} />
          <main className="min-h-screen">{children}</main>
          <Footer
            logoUrl={settings?.logo_url}
            socialLinks={settings?.social_links}
            contactInfo={contactInfo}
            tagline={siteContent?.footer_tagline}
          />
          <WhatsAppButton whatsappNumber={contactInfo?.whatsapp_number} />
        </Providers>
        <AnalyticsScripts gaId={settings?.ga_measurement_id} pixelId={settings?.meta_pixel_id} />
      </body>
    </html>
  )
}
