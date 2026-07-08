export type Locale = 'fr' | 'en' | 'ar'

export type LocalizedText = Partial<Record<Locale, string>>

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  display_order: number
  is_primary: boolean
}

export interface ProductVariant {
  id: string
  product_id: string
  color: string | null
  size: string | null
  stock_quantity: number
}

export interface Product {
  id: string
  sku: string
  slug: string
  name: LocalizedText
  description: LocalizedText
  price: number
  promo_price: number | null
  category_id: string | null
  collection_id: string | null
  colors: string[]
  sizes: string[]
  stock_quantity: number
  is_featured: boolean
  is_new: boolean
  is_active: boolean
  meta_title?: LocalizedText
  meta_description?: LocalizedText
  product_images?: ProductImage[]
  product_variants?: ProductVariant[]
}

export interface Category {
  id: string
  slug: string
  name: LocalizedText
  description: LocalizedText | null
  image_url: string | null
  display_order: number
  is_active: boolean
}

export interface Collection {
  id: string
  slug: string
  name: LocalizedText
  description: LocalizedText | null
  image_url: string | null
  is_featured: boolean
  display_order: number
  is_active: boolean
}

export interface CartItem {
  productId: string
  slug: string
  name: string
  price: number
  image: string | null
  color?: string
  size?: string
  quantity: number
  maxStock: number
}

export interface FaqItem {
  id: string
  question: LocalizedText
  answer: LocalizedText
  category: string | null
  display_order: number
  is_active: boolean
}

export interface Testimonial {
  id: string
  customer_name: string
  rating: number
  comment: LocalizedText
  avatar_url: string | null
  display_order: number
  is_approved: boolean
}

export interface GalleryItem {
  id: string
  image_url: string
  caption: LocalizedText | null
  display_order: number
  is_active: boolean
}

export interface ContactInfo {
  phone: string | null
  whatsapp_number: string | null
  email: string | null
  address: LocalizedText | null
  google_maps_query: string | null
  opening_hours: Record<string, string> | null
}

export interface Message {
  id: string
  type: 'contact' | 'product_inquiry'
  product_id: string | null
  first_name: string
  last_name: string
  phone: string
  email: string
  city: string | null
  message: string
  is_read: boolean
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  customer_name: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
}

export interface HeroSlide {
  id: string
  title: LocalizedText
  subtitle: LocalizedText | null
  image_url: string
  cta_text: LocalizedText | null
  cta_link: string | null
  display_order: number
  is_active: boolean
}

export interface Settings {
  id: number
  site_name: string
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  currency: string
  whatsapp_number: string | null
  social_links: { instagram?: string; facebook?: string; tiktok?: string } | null
  ga_measurement_id: string | null
  meta_pixel_id: string | null
}

export interface SeoGlobal {
  id: string
  page_slug: string
  meta_title: LocalizedText | null
  meta_description: LocalizedText | null
  og_image: string | null
}

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  city: string | null
  address: string | null
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  color: string | null
  size: string | null
  unit_price: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: string
  order_number: string
  status: OrderStatus
  payment_method: 'cod' | 'bank_transfer' | 'online'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'not_applicable'
  subtotal: number
  shipping_cost: number
  total: number
  created_at: string
  order_items?: OrderItem[]
}
