'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

type ToggleResult = 'added' | 'removed' | 'unauthenticated'

interface WishlistContextValue {
  ids: Set<string>
  loading: boolean
  isWishlisted: (productId: string) => boolean
  toggle: (productId: string) => Promise<ToggleResult>
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function loadWishlist(uid: string | null) {
      if (!uid) {
        if (active) {
          setIds(new Set())
          setLoading(false)
        }
        return
      }
      const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', uid)
      if (active) {
        setIds(new Set((data || []).map((row) => row.product_id as string)))
        setLoading(false)
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id || null
      if (!active) return
      setUserId(uid)
      loadWishlist(uid)
    })

    // Recharge les favoris à la connexion / déconnexion, pour rester synchronisé
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null
      setUserId(uid)
      loadWishlist(uid)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const isWishlisted = useCallback((productId: string) => ids.has(productId), [ids])

  const toggle = useCallback(
    async (productId: string): Promise<ToggleResult> => {
      if (!userId) return 'unauthenticated'
      const supabase = createClient()

      if (ids.has(productId)) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId)
        if (!error) {
          setIds((prev) => {
            const next = new Set(prev)
            next.delete(productId)
            return next
          })
        }
        return 'removed'
      }

      const { error } = await supabase.from('wishlist').insert({ user_id: userId, product_id: productId })
      if (!error) {
        setIds((prev) => new Set(prev).add(productId))
      }
      return 'added'
    },
    [ids, userId]
  )

  return (
    <WishlistContext.Provider value={{ ids, loading, isWishlisted, toggle }}>{children}</WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist doit être utilisé à l\'intérieur de <WishlistProvider>')
  return ctx
}
