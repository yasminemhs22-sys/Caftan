'use client'

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import type { CartItem } from '@/types'

interface CartContextValue {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, color?: string, size?: string) => void
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void
  clearCart: () => void
  subtotal: number
  count: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)
const STORAGE_KEY = 'lcdc-cart'

function sameLine(a: CartItem, productId: string, color?: string, size?: string) {
  return a.productId === productId && a.color === color && a.size === size
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Chargement initial depuis localStorage (une seule fois, côté client)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // localStorage indisponible ou données corrompues : on repart d'un panier vide
    } finally {
      setHydrated(true)
    }
  }, [])

  // Sauvegarde à chaque changement (après hydratation, pour ne pas écraser avec [])
  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item.productId, item.color, item.size))
      if (existing) {
        return prev.map((i) =>
          sameLine(i, item.productId, item.color, item.size)
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.maxStock || 99) }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (productId: string, color?: string, size?: string) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, color, size)))
  }

  const updateQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    setItems((prev) =>
      prev.map((i) =>
        sameLine(i, productId, color, size)
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock || 99)) }
          : i
      )
    )
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items])
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé à l\'intérieur de <CartProvider>')
  return ctx
}
