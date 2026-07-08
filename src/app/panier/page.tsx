import type { Metadata } from 'next'
import { PanierContent } from '@/components/shop/PanierContent'
import { getActiveProvider } from '@/lib/payments'

export const metadata: Metadata = {
  title: 'Panier',
  robots: { index: false, follow: false },
}

export default function PanierPage() {
  // getActiveProvider() lit des variables d'environnement serveur (jamais
  // exposées au client) — d'où ce composant serveur qui ne transmet qu'un
  // simple booléen au client, jamais les clés elles-mêmes.
  const paymentAvailable = !!getActiveProvider()

  return <PanierContent paymentAvailable={paymentAvailable} />
}
