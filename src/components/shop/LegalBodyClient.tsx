'use client'

import { useTranslation } from 'react-i18next'
import { getLocalized } from '@/lib/utils'
import type { LocalizedText } from '@/types'

/**
 * Le contenu est stocké en base sous forme de sections "Titre\nParagraphe"
 * séparées par une ligne vide (voir supabase/schema.sql, clés
 * privacy_policy_body / terms_of_sale_body). On découpe ça ici plutôt que de
 * stocker une structure jsonb imbriquée, pour rester sur le même type
 * LocalizedText (chaîne par langue) que tout le reste du site.
 */
export function LegalBodyClient({ body }: { body: LocalizedText }) {
  const { i18n } = useTranslation()
  const text = getLocalized(body, i18n.language)

  if (!text) {
    return <p className="text-sm text-noir/50">Contenu à renseigner depuis le Dashboard admin.</p>
  }

  const sections = text.split('\n\n').map((block) => {
    const [heading, ...rest] = block.split('\n')
    return { heading, body: rest.join('\n') }
  })

  return (
    <div className="space-y-6 text-sm leading-relaxed text-noir/70">
      {sections.map((section, i) => (
        <section key={i}>
          <h2 className="mb-2 font-display text-lg text-noir">{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </div>
  )
}
