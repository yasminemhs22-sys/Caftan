import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/home/Hero'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { WhyUs } from '@/components/home/WhyUs'
import { Gallery } from '@/components/home/Gallery'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { CollectionsPreview } from '@/components/home/CollectionsPreview'
import type { Product, Collection, HeroSlide, GalleryItem } from '@/types'

export const revalidate = 60

async function getHomeData() {
  const supabase = createClient()

  const [
    { data: heroSlides },
    { data: newProducts },
    { data: featuredProducts },
    { data: collections },
    { data: galleryImages },
  ] = await Promise.all([
    supabase.from('hero_slides').select('*').eq('is_active', true).order('display_order'),
    supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('is_active', true)
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase.from('collections').select('*').eq('is_active', true).order('display_order').limit(3),
    supabase.from('gallery').select('*').eq('is_active', true).order('display_order'),
  ])

  return {
    heroSlides: (heroSlides || []) as HeroSlide[],
    newProducts: (newProducts || []) as Product[],
    featuredProducts: (featuredProducts || []) as Product[],
    collections: (collections || []) as Collection[],
    galleryImages: (galleryImages || []) as GalleryItem[],
  }
}

export default async function HomePage() {
  const { heroSlides, newProducts, featuredProducts, collections, galleryImages } = await getHomeData()

  return (
    <>
      <Hero slides={heroSlides} />
      <FeaturedProducts titleKey="home.newArrivals" products={newProducts} />
      {collections.length > 0 && <CollectionsPreview collections={collections} />}
      <WhyUs />
      <FeaturedProducts titleKey="home.popularProducts" products={featuredProducts} />
      <Gallery images={galleryImages} />
      <TestimonialsSection />
    </>
  )
}
