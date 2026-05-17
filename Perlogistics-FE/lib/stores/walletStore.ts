import { create } from 'zustand'

interface Wallet {
  address: string
  balance: number
  isConnected: boolean
  chainId: number
  transactionHistory: Transaction[]
}

interface Transaction {
  id: string
  hash: string
  timestamp: Date
  amount: number
  from: string
  to: string
  status: 'pending' | 'confirmed' | 'failed'
}

interface WalletState {
  wallet: Wallet | null
  connectWallet: (address: string) => void
  disconnectWallet: () => void
  updateBalance: (balance: number) => void
  addTransaction: (transaction: Transaction) => void
  setChainId: (chainId: number) => void
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  connectWallet: (address) =>
    set({
      wallet: {
        address,
        balance: 0,
        isConnected: true,
        chainId: 1,
        transactionHistory: [],
      },
    }),
  disconnectWallet: () => set({ wallet: null }),
  updateBalance: (balance) =>
    set((state) => ({
      wallet: state.wallet ? { ...state.wallet, balance } : null,
    })),
  addTransaction: (transaction) =>
    set((state) => ({
      wallet: state.wallet
        ? {
            ...state.wallet,
            transactionHistory: [transaction, ...state.wallet.transactionHistory],
          }
        : null,
    })),
  setChainId: (chainId) =>
    set((state) => ({
      wallet: state.wallet ? { ...state.wallet, chainId } : null,
    })),
}))
