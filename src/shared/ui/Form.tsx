import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from 'react'
import { cn } from '../lib/utils'

export function Field({
  label,
  error,
  children
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium text-ink/80">
      {label}
      {children}
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
    </label>
  )
}
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full min-w-0 rounded-xl border border-ink/15 bg-white px-3 outline-none transition placeholder:text-ink/35 focus:border-copper focus:ring-2 focus:ring-copper/10',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-11 w-full min-w-0 rounded-xl border border-ink/15 bg-white px-3 outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10',
        className
      )}
      {...props}
    />
  )
)
Select.displayName = 'Select'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-24 w-full min-w-0 rounded-xl border border-ink/15 bg-white px-3 py-2 outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10',
        className
      )}
      {...props}
    />
  ))
Textarea.displayName = 'Textarea'
