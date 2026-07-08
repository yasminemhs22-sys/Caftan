import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * React.cache() mémoïse le résultat pour la durée d'un seul rendu serveur :
 * layout.tsx (generateMetadata + composant), ThemeVars, AnalyticsScripts,
 * Header et Footer peuvent tous appeler getSettings() sans multiplier les
 * allers-retours vers Supabase — une seule requête réelle est exécutée.
 */
export const getSettings = cache(async () => {
  const supabase = createClient()
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single()
  return data
})

export const getGlobalSeo = cache(async () => {
  const supabase = createClient()
  const { data } = await supabase.from('seo').select('*').eq('page_slug', 'global').single()
  return data
})

export const getContactInfo = cache(async () => {
  const supabase = createClient()
  const { data } = await supabase.from('contact_info').select('*').eq('id', 1).single()
  return data
})

/** Récupère TOUT site_content en une fois (table petite, clé/valeur) plutôt
 *  qu'une requête par clé — utilisé par le footer, À propos, et les pages
 *  légales. */
export const getSiteContentMap = cache(async () => {
  const supabase = createClient()
  const { data } = await supabase.from('site_content').select('content_key, content_value')
  const map: Record<string, any> = {}
  for (const row of data || []) {
    map[row.content_key] = row.content_value
  }
  return map
})
