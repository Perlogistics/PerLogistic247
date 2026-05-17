'use client'

import React from 'react'
import { Modal } from './Modal'
import { StatusTimeline } from '@/components/molecules/StatusTimeline'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { useUiStore } from '@/lib/stores/uiStore'
import { useShipment } from '@/lib/hooks/useShipments'

export const ShipmentDetailModal: React.FC = () => {
  const { selectedShipmentId, isModalOpen, modalType, closeModal } = useUiStore()
  const { data: shipment, isLoading } = useShipment(selectedShipmentId || '')

  if (!shipment || modalType !== 'shipment') return null

  const timelineEvents = [
    {
      timestamp: new Date(shipment.createdAt),
      title: 'Shipment Created',
      description: `Order placed from ${shipment.origin}`,
      status: 'completed' as const,
    },
    {
      timestamp: new Date(Date.now() - 86400000),
      title: 'In Transit',
      description: `En route to ${shipment.destination}`,
      status:
        shipment.status === 'in-transit' || shipment.status === 'delivered'
          ? ('completed' as const)
          : ('current' as const),
    },
    {
      timestamp: shipment.estimatedDelivery,
      title: 'Est. Delivery',
      description: 'Expected arrival date',
      status: shipment.status === 'delivered' ? ('completed' as const) : ('pending' as const),
    },
  ]

  return (
    <Modal
      isOpen={isModalOpen && modalType === 'shipment'}
      onClose={closeModal}
      title="Shipment Details"
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading details...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{shipment.trackingNumber}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={shipment.status} />
                <Badge variant="info">{shipment.carrier}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Total Value</p>
              <p className="text-2xl font-bold text-primary">${shipment.value.toLocaleString()}</p>
            </div>
          </div>

          {/* Route Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">From</p>
              <p className="font-semibold text-foreground">{shipment.origin}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">To</p>
              <p className="font-semibold text-foreground">{shipment.destination}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Weight</p>
              <p className="font-semibold text-foreground">{shipment.weight} kg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Est. Delivery</p>
              <p className="font-semibold text-foreground">
                {shipment.estimatedDelivery.toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Shipment Timeline</h4>
            <StatusTimeline events={timelineEvents} />
          </div>

          {/* Proof of Delivery */}
          {shipment.proof && (
            <div>
              <h4 className="font-semibold text-foreground mb-3">Proof of Delivery</h4>
              <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">📸 Signature proof available</p>
                <Button variant="outline" size="sm" className="mt-3">
                  View Proof
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button variant="primary">
              Download Invoice
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
