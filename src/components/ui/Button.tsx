import { ButtonHTMLAttributes, forwardRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline' | 'ghost'

interface BaseProps {
  variant?: Variant
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-noir text-dore border border-dore hover:bg-dore hover:text-noir transition-colors duration-300',
  outline:
    'bg-transparent text-noir border border-noir hover:bg-noir hover:text-creme transition-colors duration-300',
  ghost: 'bg-transparent text-noir hover:text-dore-dark transition-colors duration-300 underline-offset-4 hover:underline',
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 px-7 py-3 text-xs tracking-widest2 uppercase font-sans relative overflow-hidden'

interface ButtonProps extends BaseProps, ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, children, ...props }, ref) => (
    <button ref={ref} className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export function LinkButton({
  href,
  variant = 'primary',
  className,
  children,
}: BaseProps & { href: string }) {
  return (
    <Link href={href} className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </Link>
  )
}
