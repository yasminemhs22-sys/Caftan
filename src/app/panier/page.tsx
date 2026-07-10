import type { Metadata } from 'next'
import { PanierContent } from '@/components/shop/PanierContent'

export const metadata: Metadata = {
  title: 'Panier',
  robots: { index: false, follow: false },
}

export default function PanierPage() {
  return <PanierContent />
}