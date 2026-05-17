import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  selectedShipmentId: string | null
  isModalOpen: boolean
  modalType: 'shipment' | 'wallet' | 'settings' | null
  setSidebarOpen: (open: boolean) => void
  setSelectedShipmentId: (id: string | null) => void
  openModal: (type: 'shipment' | 'wallet' | 'settings') => void
  closeModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  selectedShipmentId: null,
  isModalOpen: false,
  modalType: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedShipmentId: (id) => set({ selectedShipmentId: id }),
  openModal: (type) => set({ isModalOpen: true, modalType: type }),
  closeModal: () => set({ isModalOpen: false, modalType: null }),
}))
