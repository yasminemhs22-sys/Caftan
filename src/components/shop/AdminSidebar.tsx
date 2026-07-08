'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Settings,
  LogOut,
  Star,
  HelpCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const LIVE_LINKS = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/produits', label: 'Produits', icon: Package },
  { href: '/admin/categories', label: 'Catégories', icon: FolderTree },
  { href: '/admin/collections', label: 'Collections', icon: Layers },
  { href: '/admin/hero', label: 'Bannières & Hero', icon: ImageIcon },
  { href: '/admin/galerie', label: 'Galerie', icon: ImageIcon },
  { href: '/admin/temoignages', label: 'Témoignages', icon: Star },
  { href: '/admin/avis', label: 'Avis clients', icon: Star },
  { href: '/admin/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/admin/reglages', label: 'Réglages & SEO', icon: Settings },
]

// Toutes les sections prévues par le cahier des charges sont désormais actives.
const PLANNED_LINKS: { label: string; icon: typeof Settings }[] = []

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-e border-noir/10 bg-white px-5 py-8 md:flex">
      <div className="mb-8 px-2">
        <p className="font-display text-lg text-noir">La Casa Del Caftan</p>
        <p className="text-xs uppercase tracking-widest2 text-dore">{role.replace('_', ' ')}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {LIVE_LINKS.map((link) => {
          const Icon = link.icon
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors',
                active ? 'bg-noir text-dore' : 'text-noir/70 hover:bg-noir/5'
              )}
            >
              <Icon size={16} strokeWidth={1.5} />
              {link.label}
            </Link>
          )
        })}

        {PLANNED_LINKS.length > 0 && (
          <p className="px-3 pb-1 pt-5 text-[10px] uppercase tracking-widest2 text-noir/30">Prochainement</p>
        )}
        {PLANNED_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <div
              key={link.label}
              className="flex cursor-not-allowed items-center gap-3 rounded px-3 py-2.5 text-sm text-noir/30"
              title="À construire dans une prochaine itération"
            >
              <Icon size={16} strokeWidth={1.5} />
              {link.label}
            </div>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-6 flex items-center gap-3 rounded px-3 py-2.5 text-sm text-noir/60 hover:bg-noir/5"
      >
        <LogOut size={16} strokeWidth={1.5} />
        Déconnexion
      </button>
    </aside>
  )
}
