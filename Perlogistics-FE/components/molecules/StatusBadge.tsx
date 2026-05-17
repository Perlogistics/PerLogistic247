import React from 'react'
import { Badge } from '@/components/atoms/Badge'

type Status = 'pending' | 'in-transit' | 'delivered' | 'failed'

interface StatusBadgeProps {
  status: Status
}

const statusConfig: Record<
  Status,
  {
    variant: 'warning' | 'info' | 'success' | 'error'
    label: string
    icon: string
  }
> = {
  pending: { variant: 'warning', label: 'Pending', icon: '⏳' },
  'in-transit': { variant: 'info', label: 'In Transit', icon: '🚚' },
  delivered: { variant: 'success', label: 'Delivered', icon: '✓' },
  failed: { variant: 'error', label: 'Failed', icon: '✗' },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant}>
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </Badge>
  )
}
