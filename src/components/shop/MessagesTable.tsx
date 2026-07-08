'use client'

import { useState, useMemo } from 'react'
import { Mail, MailOpen, Trash2, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { Message } from '@/types'

type Filter = 'all' | 'contact' | 'product_inquiry'

export function MessagesTable({ messages: initialMessages }: { messages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages)
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(
    () => (filter === 'all' ? messages : messages.filter((m) => m.type === filter)),
    [messages, filter]
  )
  const unreadCount = messages.filter((m) => !m.is_read).length

  async function handleOpen(msg: Message) {
    setOpenId(openId === msg.id ? null : msg.id)
    if (!msg.is_read) {
      const supabase = createClient()
      const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', msg.id)
      if (!error) {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)))
      }
    }
  }

  async function handleDelete(msg: Message) {
    if (!confirm('Supprimer ce message ? Cette action est irréversible.')) return
    setBusyId(msg.id)
    const supabase = createClient()
    const { error } = await supabase.from('messages').delete().eq('id', msg.id)
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
    }
    setBusyId(null)
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'contact', label: 'Contact' },
    { key: 'product_inquiry', label: 'Question produit' },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-2 text-xs uppercase tracking-widest2 ${
                filter === tab.key ? 'bg-noir text-dore' : 'bg-noir/5 text-noir/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {unreadCount > 0 && <p className="text-xs text-noir/50">{unreadCount} non lu(s)</p>}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-noir/50">Aucun message pour le moment.</p>
      ) : (
        <div className="divide-y divide-noir/10 border border-noir/10 bg-white">
          {filtered.map((msg) => {
            const isOpen = openId === msg.id
            return (
              <div key={msg.id}>
                <button onClick={() => handleOpen(msg)} className="flex w-full items-center gap-4 p-4 text-start" aria-expanded={isOpen}>
                  {msg.is_read ? (
                    <MailOpen size={16} strokeWidth={1.5} className="shrink-0 text-noir/30" />
                  ) : (
                    <Mail size={16} strokeWidth={1.5} className="shrink-0 text-dore-dark" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${msg.is_read ? 'text-noir/70' : 'text-noir'}`}>
                      {msg.first_name} {msg.last_name}
                      <span className="ms-2 text-xs text-noir/40">
                        {msg.type === 'contact' ? 'Contact' : 'Question produit'}
                      </span>
                    </p>
                    <p className="truncate text-xs text-noir/40">{msg.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-noir/40">{formatDate(msg.created_at, 'fr')}</span>
                  <ChevronDown size={16} strokeWidth={1.5} className={`shrink-0 text-noir/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="space-y-2 border-t border-noir/5 bg-creme/40 p-4 text-sm">
                    <p className="text-noir/70">{msg.message}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 pt-2 text-xs text-noir/50">
                      <a href={`tel:${msg.phone}`} className="hover:text-dore-dark">{msg.phone}</a>
                      <a href={`mailto:${msg.email}`} className="hover:text-dore-dark">{msg.email}</a>
                      {msg.city && <span>{msg.city}</span>}
                    </div>
                    <button
                      onClick={() => handleDelete(msg)}
                      disabled={busyId === msg.id}
                      className="mt-2 flex items-center gap-1.5 text-xs text-noir/40 hover:text-red-600"
                    >
                      <Trash2 size={13} strokeWidth={1.5} /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
