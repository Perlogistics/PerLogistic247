'use client'

import React, { useState } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/molecules/Input'
import { useAuthStore } from '@/lib/stores/authStore'
import { useWalletStore } from '@/lib/stores/walletStore'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { wallet, connectWallet, disconnectWallet } = useWalletStore()
  const [activeTab, setActiveTab] = useState<'account' | 'wallet' | 'preferences'>('account')

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account, wallet, and preferences.</p>
      </div>

      {/* Settings Container */}
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {[
            { id: 'account', label: 'Account' },
            { id: 'wallet', label: 'Wallet' },
            { id: 'preferences', label: 'Preferences' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Account Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Input
                  label="Full Name"
                  value={user?.name || ''}
                  readOnly
                  className="opacity-50"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Avatar</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <Button variant="outline" size="sm">
                      Upload Photo
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Role</label>
                  <div className="px-4 py-2.5 rounded-lg bg-muted text-muted-foreground font-medium">
                    {user?.role || 'Shipper'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-destructive/20 rounded-xl p-6">
              <h2 className="text-lg font-bold text-destructive mb-2">Danger Zone</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                Delete Account
              </Button>
            </div>
          </div>
        )}

        {/* Wallet Settings */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Connected Wallets</h2>

              {wallet?.isConnected ? (
                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Ethereum Wallet</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {wallet.address}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-600 rounded-full" />
                        <span className="text-sm text-emerald-600">Connected</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectWallet()}
                      className="border-destructive text-destructive"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-lg bg-muted/30 border-2 border-dashed border-border text-center mb-6">
                  <p className="text-muted-foreground mb-4">No wallet connected</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => connectWallet('0x742d35Cc6634C0532925a3b844Bc91e7f3e0d33C')}
                  >
                    Connect Wallet
                  </Button>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Add Another Wallet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect additional wallets to manage multiple accounts across different chains.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['MetaMask', 'WalletConnect', 'Ledger', 'Coinbase'].map((wallet_name) => (
                    <button
                      key={wallet_name}
                      className="p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
                    >
                      {wallet_name}
                    </button>
                  ))}
                </div>
              </div>

              {wallet?.isConnected && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3">Wallet Assets</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ETH Balance</span>
                      <span className="font-semibold text-foreground">{wallet.balance} ETH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">USD Value</span>
                      <span className="font-semibold text-foreground">
                        ${(wallet.balance * 3500).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Notification Preferences</h2>

              <div className="space-y-4">
                {[
                  { id: 'email', label: 'Email Notifications' },
                  { id: 'shipment', label: 'Shipment Updates' },
                  { id: 'alert', label: 'Alert Notifications' },
                  { id: 'report', label: 'Weekly Reports' },
                ].map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <label className="font-medium text-foreground cursor-pointer">{pref.label}</label>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Display Preferences</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Theme</label>
                  <div className="flex gap-3">
                    {['Light', 'Dark', 'Auto'].map((theme) => (
                      <button
                        key={theme}
                        className="px-4 py-2 rounded-lg border-2 border-border hover:border-primary transition-colors"
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Language</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border-2 border-border bg-input text-foreground">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Chinese</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
