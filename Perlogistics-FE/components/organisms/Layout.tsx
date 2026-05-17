'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ShipmentDetailModal } from './ShipmentDetailModal'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <TopBar />
      <main className="pt-16 md:pl-64 pb-8">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
      <ShipmentDetailModal />
    </div>
  )
}
