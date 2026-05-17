'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { useWalletStore } from '@/lib/stores/walletStore'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/molecules/Input'

export default function AuthPage() {
  const router = useRouter()
  const { login, loginWithWallet, isLoading } = useAuthStore()
  const { connectWallet } = useWalletStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMethod, setAuthMethod] = useState<'email' | 'wallet'>('email')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleWalletLogin = async () => {
    try {
      // Mock wallet address
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc91e7f3e0d33C'
      await loginWithWallet(mockAddress)
      connectWallet(mockAddress)
      router.push('/dashboard')
    } catch (error) {
      console.error('Wallet login error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">PerLogistics</h1>
            <p className="text-muted-foreground">Supply Chain Management Platform</p>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex gap-2 mb-8 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-2 rounded-md font-medium transition-all duration-200 ${
                authMethod === 'email'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setAuthMethod('wallet')}
              className={`flex-1 py-2 rounded-md font-medium transition-all duration-200 ${
                authMethod === 'wallet'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Wallet
            </button>
          </div>

          {/* Email Login Form */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" />
                  Remember me
                </label>
                <a href="#" className="text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>
          )}

          {/* Wallet Login */}
          {authMethod === 'wallet' && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Connect Wallet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your crypto wallet to access the platform. We support all major wallets.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {['MetaMask', 'WalletConnect', 'Ledger', 'Coinbase'].map((wallet) => (
                    <button
                      key={wallet}
                      className="p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
                    >
                      {wallet}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                onClick={handleWalletLogin}
              >
                Connect Wallet
              </Button>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with social</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Google', icon: '🔍' },
              { name: 'GitHub', icon: '🐙' },
              { name: 'Twitter', icon: '𝕏' },
            ].map((provider) => (
              <button
                key={provider.name}
                className="p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-lg"
                title={provider.name}
              >
                {provider.icon}
              </button>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <a href="#" className="text-primary hover:underline font-medium">
              Sign up
            </a>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🔒', label: 'Secure' },
            { icon: '⚡', label: 'Fast' },
            { icon: '🌐', label: 'Global' },
          ].map((feature) => (
            <div key={feature.label} className="p-3 bg-card/50 backdrop-blur border border-border/30 rounded-lg">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <p className="text-xs font-medium text-muted-foreground">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
