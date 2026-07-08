import { hexToRgbTriplet, adjustLightness, SHADE_DELTAS } from '@/lib/color'

interface Props {
  primaryColor?: string | null
  secondaryColor?: string | null
  accentColor?: string | null
}

/**
 * Injecte les couleurs choisies dans Réglages > Couleurs comme variables CSS
 * dans le <head>. Les nuances claires/foncées (noir-soft, dore-light,
 * dore-dark) sont dérivées automatiquement des 2 couleurs de base plutôt que
 * de demander 5 sélecteurs de couleur distincts dans le formulaire.
 * Tant que personne n'a touché aux Réglages, ces valeurs reproduisent
 * l'identité visuelle d'origine (voir globals.css pour les valeurs de repli).
 */
export function ThemeVars({ primaryColor, secondaryColor, accentColor }: Props) {
  const noir = primaryColor || '#0A0A0A'
  const creme = secondaryColor || '#FAF9F6'
  const dore = accentColor || '#D4AF37'

  const css = `:root {
  --color-noir: ${hexToRgbTriplet(noir)};
  --color-noir-soft: ${adjustLightness(noir, SHADE_DELTAS.noirSoft)};
  --color-creme: ${hexToRgbTriplet(creme)};
  --color-dore: ${hexToRgbTriplet(dore)};
  --color-dore-light: ${adjustLightness(dore, SHADE_DELTAS.doreLight)};
  --color-dore-dark: ${adjustLightness(dore, SHADE_DELTAS.doreDark)};
}`

  // eslint-disable-next-line react/no-danger
  return <style id="theme-vars" dangerouslySetInnerHTML={{ __html: css }} />
}
