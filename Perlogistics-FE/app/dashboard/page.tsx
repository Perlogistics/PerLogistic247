'use client'

import React from 'react'
import { Layout } from '@/components/organisms/Layout'
import { KpiCard } from '@/components/atoms/KpiCard'
import { ShipmentCard } from '@/components/molecules/ShipmentCard'
import { useShipments } from '@/lib/hooks/useShipments'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { useUiStore } from '@/lib/stores/uiStore'

export default function DashboardPage() {
  const { data: shipments = [], isLoading: shipmentsLoading } = useShipments()
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics()
  const { setSelectedShipmentId, openModal } = useUiStore()

  const recentShipments = shipments.slice(0, 3)

  const handleSelectShipment = (shipmentId: string) => {
    setSelectedShipmentId(shipmentId)
    openModal('shipment')
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your logistics overview.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-medium">
          Create Shipment
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-in">
        <KpiCard
          label="Total Shipments"
          value={analytics?.totalShipments || 0}
          icon="📦"
          variant="primary"
        />
        <KpiCard
          label="Completed"
          value={analytics?.completedShipments || 0}
          icon="✓"
          trend="up"
          trendValue="12%"
          variant="secondary"
        />
        <KpiCard
          label="In Transit"
          value={analytics?.pendingShipments || 0}
          icon="🚚"
          variant="primary"
        />
        <KpiCard
          label="Total Value"
          value={`$${analytics?.totalValue.toLocaleString() || 0}`}
          icon="💰"
          trend="up"
          trendValue="8%"
          variant="accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Shipments */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Recent Shipments</h2>
              <a href="/shipments" className="text-sm text-primary hover:underline font-medium">
                View All
              </a>
            </div>

            {shipmentsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading shipments...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    onClick={() => handleSelectShipment(shipment.id)}
                    className="p-4 border border-border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{shipment.trackingNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {shipment.origin} → {shipment.destination}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            shipment.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                              : shipment.status === 'in-transit'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          }`}
                        >
                          {shipment.status}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">${shipment.value.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-foreground mb-4">Network Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Health Score</span>
                  <span className="text-sm font-bold text-secondary">94.5%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[94.5%] bg-gradient-to-r from-secondary to-accent" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Avg. Delivery Time</span>
                  <span className="text-sm font-bold text-primary">{analytics?.averageDeliveryTime}d</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[60%] bg-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { icon: '📦', text: 'Shipment TRK001 delivered' },
                { icon: '🚚', text: 'TRK002 picked up' },
                { icon: '⚠️', text: 'Delay alert on TRK003' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0">
                  <span className="text-lg">{activity.icon}</span>
                  <p className="text-sm text-muted-foreground">{activity.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
