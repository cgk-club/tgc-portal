'use client'

import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-[4px] font-body font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green/50 disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-green text-white hover:bg-green-light',
        variant === 'secondary' && 'bg-gold text-white hover:bg-gold/90',
        variant === 'ghost' && 'bg-transparent text-green hover:bg-green-muted',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
