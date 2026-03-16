import Badge from '@/components/ui/Badge'

interface FicheStatusBadgeProps {
  status: string
}

export default function FicheStatusBadge({ status }: FicheStatusBadgeProps) {
  const variant = status === 'live' ? 'green' : status === 'draft' ? 'gold' : 'gray'
  return <Badge variant={variant}>{status}</Badge>
}
