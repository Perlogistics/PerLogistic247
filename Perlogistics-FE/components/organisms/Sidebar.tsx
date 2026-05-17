'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUiStore } from '@/lib/stores/uiStore'
import { useAuthStore } from '@/lib/stores/authStore'
import { Button } from '@/components/atoms/Button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Shipments', href: '/shipments', icon: '📦' },
  { name: 'Tracking', href: '/tracking', icon: '🗺️' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUiStore()
  const { user, logout } = useAuthStore()

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border
          transition-transform duration-300 z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
            PerLogistics
          </h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">Supply Chain Hub</p>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-primary/20'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="px-4 py-3 rounded-lg bg-sidebar-primary/10">
            <p className="text-xs text-sidebar-foreground/60 mb-1">Logged in as</p>
            <p className="font-semibold text-sidebar-foreground truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-sidebar-foreground/60">{user?.email}</p>
          </div>

          <Button
            variant="outline"
            size="md"
            className="w-full text-primary border-primary/20 hover:bg-primary/5"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}
