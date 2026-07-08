/**
 * Affiché tant qu'un produit n'a pas encore de vraie photo en base.
 * Volontairement sobre : évite de faire croire à une photo réelle
 * (aucune image externe n'est utilisée dans ce projet, cf. cahier des charges).
 */
export function ProductImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br from-noir via-noir-soft to-noir ${className || ''}`}
    >
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="opacity-70">
        <circle cx="36" cy="36" r="35" stroke="rgb(var(--color-dore))" strokeWidth="1" />
        <text
          x="36"
          y="44"
          textAnchor="middle"
          fontFamily="serif"
          fontSize="24"
          fill="rgb(var(--color-dore))"
        >
          LC
        </text>
      </svg>
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest2 text-dore/70">
        Photo à venir
      </span>
    </div>
  )
}
