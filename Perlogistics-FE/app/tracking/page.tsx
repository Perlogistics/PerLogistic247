'use client'

import React, { useState } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { Input } from '@/components/molecules/Input'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/atoms/Badge'
import { useShipments } from '@/lib/hooks/useShipments'

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: shipments = [] } = useShipments()

  const selectedShipment = selectedId ? shipments.find((s) => s.id === selectedId) : null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const found = shipments.find((s) => s.trackingNumber.toLowerCase() === trackingNumber.toLowerCase())
    if (found) {
      setSelectedId(found.id)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">Track Your Shipment</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enter your tracking number to get real-time updates on your shipment location and status.
        </p>
      </div>

      {/* Search Box */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Enter tracking number (e.g., TRK001)..."
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            icon="🔍"
            className="flex-1"
          />
          <Button variant="primary" size="md" type="submit">
            Search
          </Button>
        </form>
      </div>

      {/* Results */}
      {selectedShipment ? (
        <div className="max-w-4xl mx-auto space-y-8 animate-slide-in">
          {/* Shipment Overview */}
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{selectedShipment.trackingNumber}</h2>
                <p className="text-muted-foreground">
                  {selectedShipment.origin} → {selectedShipment.destination}
                </p>
              </div>
              <Badge
                variant={
                  selectedShipment.status === 'delivered'
                    ? 'success'
                    : selectedShipment.status === 'in-transit'
                      ? 'info'
                      : 'warning'
                }
                size="md"
              >
                {selectedShipment.status.charAt(0).toUpperCase() + selectedShipment.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="text-sm font-semibold text-foreground capitalize">{selectedShipment.status}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Weight</p>
                <p className="text-sm font-semibold text-foreground">{selectedShipment.weight} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Value</p>
                <p className="text-sm font-semibold text-primary">${selectedShipment.value.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Est. Delivery</p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedShipment.estimatedDelivery.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Status Progress */}
          <div className="bg-card border border-border rounded-xl p-8">
            <h3 className="text-xl font-bold text-foreground mb-6">Shipment Progress</h3>

            <div className="relative">
              {/* Progress Bar */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-border rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                  style={{
                    width: selectedShipment.status === 'delivered' ? '100%' : '50%',
                  }}
                />
              </div>

              {/* Timeline Points */}
              <div className="relative flex justify-between">
                {[
                  { label: 'Created', completed: true },
                  {
                    label: 'In Transit',
                    completed:
                      selectedShipment.status === 'in-transit' || selectedShipment.status === 'delivered',
                  },
                  { label: 'Delivered', completed: selectedShipment.status === 'delivered' },
                ].map((point, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-4 ${
                        point.completed
                          ? 'bg-secondary border-secondary'
                          : 'bg-muted border-border'
                      }`}
                    />
                    <span className="mt-3 text-sm font-medium text-foreground">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-card border border-border rounded-xl overflow-hidden h-96">
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-2">🗺️</span>
                <p className="text-muted-foreground">Real-time tracking map would load here</p>
              </div>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="bg-card border border-border rounded-xl p-8">
            <h3 className="text-xl font-bold text-foreground mb-6">Shipment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Origin</p>
                  <p className="font-semibold text-foreground">{selectedShipment.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Destination</p>
                  <p className="font-semibold text-foreground">{selectedShipment.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Carrier</p>
                  <p className="font-semibold text-foreground">{selectedShipment.carrier}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created Date</p>
                  <p className="font-semibold text-foreground">
                    {selectedShipment.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Est. Delivery</p>
                  <p className="font-semibold text-foreground">
                    {selectedShipment.estimatedDelivery.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Value</p>
                  <p className="font-semibold text-primary">${selectedShipment.value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setSelectedId(null)}>
              Back to Search
            </Button>
            <Button variant="primary" className="flex-1">
              Download Receipt
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-foreground font-semibold text-lg mb-2">No shipment selected</p>
            <p className="text-muted-foreground">Enter a tracking number to view details</p>
          </div>
        </div>
      )}
    </Layout>
  )
}
