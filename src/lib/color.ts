/**
 * Conversion "#RRGGBB" -> "R G B" (triplet espacé, sans virgules ni "#"),
 * le format attendu par les variables CSS consommées dans tailwind.config.ts
 * via rgb(var(--color-x) / <alpha-value>).
 */
export function hexToRgbTriplet(hex: string): string {
  const clean = (hex || '').replace('#', '').trim()
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return '10 10 10' // repli sur le noir de marque si valeur invalide
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `${r} ${g} ${b}`
}

/**
 * Éclaircit (percent > 0) ou assombrit (percent < 0) une couleur hex en
 * ajustant sa luminosité HSL, et renvoie directement le triplet RGB résultant.
 * Utilisé pour dériver noir-soft / dore-light / dore-dark à partir des 2
 * couleurs choisies dans les Réglages, sans demander 5 sélecteurs de couleur
 * à la boutique.
 */
export function adjustLightness(hex: string, percent: number): string {
  const clean = (hex || '').replace('#', '').trim()
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return '10 10 10'

  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h /= 6
  }

  const newL = Math.min(1, Math.max(0, l + percent / 100))

  function channel(p: number, q: number, t: number) {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }

  let nr: number
  let ng: number
  let nb: number
  if (s === 0) {
    nr = ng = nb = newL
  } else {
    const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s
    const p = 2 * newL - q
    nr = channel(p, q, h + 1 / 3)
    ng = channel(p, q, h)
    nb = channel(p, q, h - 1 / 3)
  }

  return `${Math.round(nr * 255)} ${Math.round(ng * 255)} ${Math.round(nb * 255)}`
}

/** Pourcentages calibrés pour retrouver les teintes d'origine de la charte
 *  quand les couleurs des Réglages sont encore celles par défaut. */
export const SHADE_DELTAS = {
  noirSoft: 4,
  doreLight: 13,
  doreDark: -8,
} as const
