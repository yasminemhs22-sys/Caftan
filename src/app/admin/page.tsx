import Link from 'next/link'
import {
  Package,
  MessageSquare,
  Mail,
  ShoppingBag,
  FolderTree,
  Layers,
  Image as ImageIcon,
  Star,
  HelpCircle,
  Settings,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = createClient()
  const [{ count: products }, { count: unreadMessages }, { count: subscribers }, { count: orders }] =
    await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
    ])
  return {
    products: products || 0,
    unreadMessages: unreadMessages || 0,
    subscribers: subscribers || 0,
    orders: orders || 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Produits', value: stats.products, icon: Package, href: '/admin/produits' },
    { label: 'Commandes', value: stats.orders, icon: ShoppingBag, href: '#' },
    { label: 'Messages non lus', value: stats.unreadMessages, icon: MessageSquare, href: '/admin/messages' },
    { label: 'Abonnés newsletter', value: stats.subscribers, icon: Mail, href: '#' },
  ]

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl text-noir">Tableau de bord</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="border border-noir/10 bg-white p-6 transition-colors hover:border-dore/40"
            >
              <Icon size={20} strokeWidth={1.5} className="mb-4 text-dore-dark" />
              <p className="text-2xl text-noir">{card.value}</p>
              <p className="mt-1 text-xs uppercase tracking-widest2 text-noir/50">{card.label}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-10 border border-dore/30 bg-dore/5 p-5 text-sm text-noir/70">
        <strong className="text-noir">Statistiques de visiteurs :</strong> nécessitent un outil d'analytics
        (Plausible, Google Analytics...) qui n'est pas encore branché dans cette livraison — à connecter dans
        une prochaine itération.
      </div>

      <h2 className="mb-4 mt-12 font-display text-lg text-noir">Gérer le site</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[
          { label: 'Produits', href: '/admin/produits', icon: Package },
          { label: 'Catégories', href: '/admin/categories', icon: FolderTree },
          { label: 'Collections', href: '/admin/collections', icon: Layers },
          { label: 'Bannières & Hero', href: '/admin/hero', icon: ImageIcon },
          { label: 'Galerie', href: '/admin/galerie', icon: ImageIcon },
          { label: 'Témoignages', href: '/admin/temoignages', icon: Star },
          { label: 'Avis clients', href: '/admin/avis', icon: Star },
          { label: 'FAQ', href: '/admin/faq', icon: HelpCircle },
          { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
          { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
          { label: 'Réglages & SEO', href: '/admin/reglages', icon: Settings },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 border border-noir/10 bg-white px-3 py-5 text-center transition-colors hover:border-dore/40 hover:bg-dore/5"
            >
              <Icon size={20} strokeWidth={1.5} className="text-dore-dark" />
              <span className="text-xs text-noir">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
