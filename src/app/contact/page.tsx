import type { Metadata } from 'next'
import { ContactContent } from '@/components/shop/ContactContent'
import { getContactInfo } from '@/lib/settings'
import type { ContactInfo } from '@/types'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez La Casa Del Caftan : téléphone, WhatsApp, e-mail et adresse à Alger Plage, Algérie.',
}

export default async function ContactPage() {
  const data = await getContactInfo()

  const contact: ContactInfo = data || {
    phone: '0540984852',
    whatsapp_number: '213540984852',
    email: 'casacaftan16@gmail.com',
    address: { fr: 'RN24, Alger Plage, Algérie, 16000' },
    google_maps_query: 'RN24, Alger Plage, Algeria, 16000',
    opening_hours: null,
  }

  return <ContactContent contact={contact} />
}
