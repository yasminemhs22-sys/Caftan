'use client'

import { MessageCircle } from 'lucide-react'

export function WhatsAppButton({ whatsappNumber }: { whatsappNumber?: string | null }) {
  const number = whatsappNumber || '213540984852'
  const message = encodeURIComponent('Bonjour, je souhaite avoir des informations sur vos produits.')

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous contacter sur WhatsApp"
      className="fixed bottom-6 end-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition-transform hover:scale-105"
    >
      <MessageCircle size={26} fill="white" strokeWidth={0} />
    </a>
  )
}
