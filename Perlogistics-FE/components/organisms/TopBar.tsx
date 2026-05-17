'use client'

import React from 'react'
import { useWalletStore } from '@/lib/stores/walletStore'
import { useUiStore } from '@/lib/stores/uiStore'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/atoms/Badge'

export const TopBar: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet } = useWalletStore()
  const { openModal } = useUiStore()

  const handleWalletConnect = async () => {
    if (wallet?.isConnected) {
      disconnectWallet()
    } else {
      // Mock wallet connection
      connectWallet('0x742d35Cc6634C0532925a3b844Bc91e7f3e0d33C')
    }
  }

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 bg-card border-b border-border z-20">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-primary/10 transition-colors">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* Wallet Status */}
          {wallet?.isConnected && (
            <Badge variant="success" size="md">
              <span className="w-2 h-2 bg-emerald-600 rounded-full" />
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </Badge>
          )}

          {/* Wallet Button */}
          <Button
            variant={wallet?.isConnected ? 'secondary' : 'primary'}
            size="md"
            onClick={handleWalletConnect}
            className="gap-2"
          >
            {wallet?.isConnected ? '🔗' : '💼'}
            {wallet?.isConnected ? 'Disconnect' : 'Connect Wallet'}
          </Button>

          {/* Settings */}
          <button
            onClick={() => openModal('settings')}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <span className="text-xl">⚙️</span>
          </button>
        </div>
      </div>
    </header>
  )
}
