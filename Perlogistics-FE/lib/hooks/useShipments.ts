import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Shipment {
  id: string
  trackingNumber: string
  origin: string
  destination: string
  status: 'pending' | 'in-transit' | 'delivered' | 'failed'
  weight: number
  value: number
  createdAt: Date
  estimatedDelivery: Date
  carrier: string
  proof?: string
  latitude?: number
  longitude?: number
}

// Mock data
const mockShipments: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'TRK001',
    origin: 'New York, NY',
    destination: 'Los Angeles, CA',
    status: 'in-transit',
    weight: 50,
    value: 5000,
    createdAt: new Date('2024-05-10'),
    estimatedDelivery: new Date('2024-05-18'),
    carrier: 'PerLogistics',
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: '2',
    trackingNumber: 'TRK002',
    origin: 'Chicago, IL',
    destination: 'Miami, FL',
    status: 'delivered',
    weight: 30,
    value: 3000,
    createdAt: new Date('2024-05-05'),
    estimatedDelivery: new Date('2024-05-15'),
    carrier: 'PerLogistics',
    proof: 'https://example.com/proof.jpg',
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    id: '3',
    trackingNumber: 'TRK003',
    origin: 'Seattle, WA',
    destination: 'Denver, CO',
    status: 'pending',
    weight: 100,
    value: 8000,
    createdAt: new Date('2024-05-15'),
    estimatedDelivery: new Date('2024-05-22'),
    carrier: 'PerLogistics',
    latitude: 47.6062,
    longitude: -122.3321,
  },
]

export const useShipments = () => {
  return useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockShipments
    },
  })
}

export const useShipment = (id: string) => {
  return useQuery({
    queryKey: ['shipments', id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockShipments.find((s) => s.id === id)
    },
    enabled: !!id,
  })
}

export const useCreateShipment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (shipment: Omit<Shipment, 'id' | 'createdAt'>) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { id: Math.random().toString(), ...shipment, createdAt: new Date() }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
    },
  })
}

export const useUpdateShipment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (shipment: Shipment) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return shipment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
    },
  })
}
