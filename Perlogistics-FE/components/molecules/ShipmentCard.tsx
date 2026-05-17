import React from 'react'
import { Shipment } from '@/lib/hooks/useShipments'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/atoms/Button'

interface ShipmentCardProps {
  shipment: Shipment
  onSelect?: (shipment: Shipment) => void
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment, onSelect }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground mb-1">{shipment.trackingNumber}</h3>
          <p className="text-xs text-muted-foreground">{shipment.carrier}</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-primary font-medium">From:</span>
          <span className="text-muted-foreground">{shipment.origin}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-secondary font-medium">To:</span>
          <span className="text-muted-foreground">{shipment.destination}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground">Weight</p>
          <p className="text-sm font-semibold text-foreground">{shipment.weight} kg</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Value</p>
          <p className="text-sm font-semibold text-foreground">${shipment.value.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Est. Delivery</p>
          <p className="text-sm font-semibold text-foreground">
            {shipment.estimatedDelivery.toLocaleDateString()}
          </p>
        </div>
      </div>

      <Button
        variant="primary"
        size="sm"
        className="w-full"
        onClick={() => onSelect?.(shipment)}
      >
        View Details
      </Button>
    </div>
  )
}
