import type { Metadata } from 'next'
import { LegalBodyClient } from '@/components/shop/LegalBodyClient'
import { TranslatedH1 } from '@/components/ui/TranslatedH1'
import { getSiteContentMap } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
}

export default async function ConditionsGeneralesPage() {
  const siteContent = await getSiteContentMap()

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <TranslatedH1 i18nKey="legal.termsTitle" className="mb-4 font-display text-3xl text-noir" />

      <div className="mb-10 border border-dore/40 bg-dore/5 p-4 text-sm text-noir/70">
        <strong className="text-noir">Modèle à personnaliser.</strong> Ce texte est un modèle générique
        professionnel, pas un document juridique validé pour votre activité précise (délais de livraison,
        zones couvertes, frais de port et politique de retour réels à préciser). Faites valider ce document
        par un professionnel avant mise en ligne définitive. Le contenu ci-dessous est éditable depuis le
        Dashboard Admin.
      </div>

      <LegalBodyClient body={siteContent.terms_of_sale_body} />
    </div>
  )
}
