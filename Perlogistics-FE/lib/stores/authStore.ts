import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  walletAddress?: string
  role: 'shipper' | 'logistics' | 'admin'
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithWallet: (address: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    set({ isLoading: true })
    // Mock login
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const user: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      role: 'shipper',
    }
    set({ user, isAuthenticated: true, isLoading: false })
  },
  loginWithWallet: async (address: string) => {
    set({ isLoading: true })
    // Mock wallet login
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const user: User = {
      id: '2',
      email: `${address.slice(0, 6)}@wallet`,
      name: `Wallet User`,
      walletAddress: address,
      role: 'shipper',
    }
    set({ user, isAuthenticated: true, isLoading: false })
  },
  logout: () => set({ user: null, isAuthenticated: false }),
  setUser: (user) => set({ user, isAuthenticated: true }),
}))
