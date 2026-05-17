'use client'

import React from 'react'
import { Layout } from '@/components/organisms/Layout'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAnalytics, useShipmentStats } from '@/lib/hooks/useAnalytics'
import { KpiCard } from '@/components/atoms/KpiCard'

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics()
  const { data: stats } = useShipmentStats()

  const chartColors = ['#0A1F44', '#008080', '#FF8C00', '#4B5563', '#A0AEC0']

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Monitor your supply chain performance and network health.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Total Revenue"
          value={`$${(analytics?.totalValue || 0) / 1000}K`}
          icon="💵"
          variant="primary"
        />
        <KpiCard
          label="Success Rate"
          value="96.2%"
          icon="✓"
          trend="up"
          trendValue="2.4%"
          variant="secondary"
        />
        <KpiCard
          label="Avg Confirmation"
          value={`${stats?.avgConfirmationTime || 0}h`}
          icon="⏱️"
          variant="primary"
        />
        <KpiCard
          label="Network Health"
          value={`${stats?.networkHealth || 0}%`}
          icon="🌐"
          variant="accent"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Monthly Revenue Trend</h2>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={chartColors[2]}
                  strokeWidth={2}
                  dot={{ fill: chartColors[2] }}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Shipment Volume Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Shipment Volume</h2>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="shipments" fill={chartColors[0]} name="Shipments" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Shipment Status Distribution</h2>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.status}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(stats?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Routes */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Top Routes</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              analytics?.topRoutes.map((route, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{route.route}</p>
                    <p className="text-sm text-muted-foreground">{route.count} shipments</p>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                      style={{
                        width: `${(route.count / (analytics?.topRoutes[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="font-semibold text-foreground min-w-fit">{route.count}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
