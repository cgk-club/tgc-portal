import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'green' | 'gray'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-green-muted text-green',
        variant === 'gold' && 'bg-gold-light text-yellow-800',
        variant === 'green' && 'bg-green text-white',
        variant === 'gray' && 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {children}
    </span>
  )
}
