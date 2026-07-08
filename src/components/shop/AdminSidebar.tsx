'use client'

import { useState } from 'react'
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
  Menu,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const currentLabel = LIVE_LINKS.find((l) => l.href === pathname)?.label || 'Dashboard Admin'

  return (
    <>
      {/* ---- Barre mobile ---- */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-noir/10 bg-white px-4 py-3.5 md:hidden">
        <div>
          <p className="font-display text-sm text-noir">{currentLabel}</p>
          <p className="text-[10px] uppercase tracking-widest2 text-dore">{role.replace('_', ' ')}</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu admin"
          className="flex h-10 w-10 items-center justify-center text-noir"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-noir/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-[82%] max-w-xs flex-col overflow-y-auto bg-white px-5 py-6"
            >
              <div className="mb-6 flex items-center justify-between px-1">
                <div>
                  <p className="font-display text-lg text-noir">La Casa Del Caftan</p>
                  <p className="text-xs uppercase tracking-widest2 text-dore">{role.replace('_', ' ')}</p>
                </div>
                <button onClick={() => setMobileOpen(false)} aria-label="Fermer" className="p-1 text-noir/60">
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {LIVE_LINKS.map((link) => {
                  const Icon = link.icon
                  const active = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded px-3 py-3 text-sm transition-colors',
                        active ? 'bg-noir text-dore' : 'text-noir/70 hover:bg-noir/5'
                      )}
                    >
                      <Icon size={16} strokeWidth={1.5} />
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="mt-6 flex items-center gap-3 rounded px-3 py-3 text-sm text-noir/60 hover:bg-noir/5"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Déconnexion
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Sidebar desktop ---- */}
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
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 rounded px-3 py-2.5 text-sm text-noir/60 hover:bg-noir/5"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Déconnexion
        </button>
      </aside>
    </>
  )
}
