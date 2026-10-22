import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  loading?: boolean
}

export function Button({
  className,
  variant = 'primary',
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-copper/40 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-ink text-white hover:bg-copper',
        variant === 'secondary' && 'border border-ink/15 bg-white text-ink hover:border-copper/50',
        variant === 'danger' && 'bg-red-50 text-red-700 hover:bg-red-100',
        variant === 'ghost' && 'text-ink/65 hover:bg-ink/5 hover:text-ink',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
