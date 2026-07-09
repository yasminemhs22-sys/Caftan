'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalized, formatPrice } from '@/lib/utils'
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder'
import type { Product } from '@/types'

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter()
  const [items, setItems] = useState(products)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function toggleActive(product: Product) {
    setBusyId(product.id)
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    if (!error) {
      setItems((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p)))
    }
    setBusyId(null)
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Supprimer « ${getLocalized(product.name, 'fr')} » ? Cette action est irréversible.`)) return
    setBusyId(product.id)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (!error) {
      setItems((prev) => prev.filter((p) => p.id !== product.id))
    }
    setBusyId(null)
    router.refresh()
  }

  if (!items.length) {
    return <p className="text-sm text-noir/50">Aucun produit. Cliquez sur « Ajouter » pour créer le premier.</p>
  }

  return (
    <div className="overflow-x-auto border border-noir/10 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-noir/10 text-start text-xs uppercase tracking-widest2 text-noir/40">
            <th className="p-4 text-start">Produit</th>
            <th className="p-4 text-start">SKU</th>
            <th className="p-4 text-start">Prix</th>
            <th className="p-4 text-start">Stock</th>
            <th className="p-4 text-start">Statut</th>
            <th className="p-4 text-start">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((product) => {
            const image = product.product_images?.[0]
            return (
              <tr key={product.id} className="border-b border-noir/5 last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-noir">
                      {image ? (
                        <Image src={image.url} alt="" fill className="object-cover" />
                      ) : (
                        <ProductImagePlaceholder />
                      )}
                    </div>
                    <span className="text-noir">{getLocalized(product.name, 'fr')}</span>
                  </div>
                </td>
                <td className="p-4 text-noir/60">{product.sku}</td>
                <td className="p-4 text-noir/60">{formatPrice(product.price, 'DA', 'fr')}</td>
                <td className="p-4 text-noir/60">{product.stock_quantity}</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleActive(product)}
                    disabled={busyId === product.id}
                    className={`px-2.5 py-1 text-xs uppercase tracking-widest2 ${
                      product.is_active ? 'bg-dore/10 text-dore-dark' : 'bg-noir/5 text-noir/40'
                    }`}
                  >
                    {product.is_active ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/produits/${product.id}`} aria-label="Modifier" className="text-noir/40 hover:text-dore-dark">
                      <Pencil size={16} strokeWidth={1.5} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={busyId === product.id}
                      aria-label="Supprimer"
                      className="text-noir/40 hover:text-red-600"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
