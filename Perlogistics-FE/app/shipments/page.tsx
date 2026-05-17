'use client'

import React, { useState, useMemo } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { ShipmentCard } from '@/components/molecules/ShipmentCard'
import { Input } from '@/components/molecules/Input'
import { Button } from '@/components/atoms/Button'
import { useShipments } from '@/lib/hooks/useShipments'
import { useUiStore } from '@/lib/stores/uiStore'

export default function ShipmentsPage() {
  const { data: shipments = [], isLoading } = useShipments()
  const { setSelectedShipmentId, openModal } = useUiStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-transit' | 'delivered' | 'failed'>('all')

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const matchesSearch =
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [shipments, searchTerm, statusFilter])

  const handleSelectShipment = (shipmentId: string) => {
    setSelectedShipmentId(shipmentId)
    openModal('shipment')
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Shipment Tracking</h1>
        <p className="text-muted-foreground">Track and manage all your shipments in real-time.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            placeholder="Search by tracking number, origin, or destination..."
            icon="🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 rounded-lg border-2 border-border bg-input text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          {['all', 'pending', 'in-transit', 'delivered', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-border'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredShipments.length} of {shipments.length} shipments
        </p>
        <Button variant="secondary" size="sm">
          Export as CSV
        </Button>
      </div>

      {/* Shipment Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Loading shipments...</p>
          </div>
        </div>
      ) : filteredShipments.length === 0 ? (
        <div className="flex items-center justify-center h-96 rounded-xl border-2 border-dashed border-border">
          <div className="text-center">
            <p className="text-2xl mb-2">📦</p>
            <p className="text-foreground font-semibold mb-1">No shipments found</p>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShipments.map((shipment) => (
            <div
              key={shipment.id}
              onClick={() => handleSelectShipment(shipment.id)}
              className="cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <ShipmentCard shipment={shipment} onSelect={handleSelectShipment} />
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
