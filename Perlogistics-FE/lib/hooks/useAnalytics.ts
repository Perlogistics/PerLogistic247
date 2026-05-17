import { useQuery } from '@tanstack/react-query'

export interface AnalyticsData {
  totalShipments: number
  completedShipments: number
  pendingShipments: number
  failedShipments: number
  totalValue: number
  averageDeliveryTime: number
  monthlyData: {
    month: string
    shipments: number
    revenue: number
  }[]
  topRoutes: {
    route: string
    count: number
  }[]
}

const mockAnalyticsData: AnalyticsData = {
  totalShipments: 1250,
  completedShipments: 980,
  pendingShipments: 220,
  failedShipments: 50,
  totalValue: 1250000,
  averageDeliveryTime: 4.5,
  monthlyData: [
    { month: 'Jan', shipments: 150, revenue: 125000 },
    { month: 'Feb', shipments: 180, revenue: 145000 },
    { month: 'Mar', shipments: 200, revenue: 165000 },
    { month: 'Apr', shipments: 220, revenue: 180000 },
    { month: 'May', shipments: 250, revenue: 210000 },
    { month: 'Jun', shipments: 250, revenue: 225000 },
  ],
  topRoutes: [
    { route: 'NY → LA', count: 120 },
    { route: 'Chicago → Miami', count: 95 },
    { route: 'Seattle → Denver', count: 85 },
    { route: 'Boston → Atlanta', count: 72 },
  ],
}

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600))
      return mockAnalyticsData
    },
  })
}

export const useShipmentStats = () => {
  return useQuery({
    queryKey: ['shipment-stats'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400))
      return {
        statusDistribution: [
          { status: 'Delivered', value: 980 },
          { status: 'In Transit', value: 220 },
          { status: 'Failed', value: 50 },
        ],
        networkHealth: 94.5,
        avgConfirmationTime: 2.3,
      }
    },
  })
}
