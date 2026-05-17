# PerLogistics - Supply Chain Management Platform

A modern, full-featured supply chain and logistics management platform built with React, Next.js, Zustand, and React Query. Features real-time shipment tracking, analytics dashboards, wallet integration, and blockchain-native UI elements.

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **UI**: React 19+ with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand (lightweight store), React Query (server state)
- **Data Fetching**: React Query (TanStack Query)
- **Visualization**: Recharts for analytics and charts
- **Maps**: React-map-gl (optional, for tracking visualization)
- **Package Manager**: pnpm

## Color Palette

The application uses a carefully selected color scheme optimized for logistics and blockchain interfaces:

- **Primary**: #0A1F44 (Navy) - Main brand color
- **Secondary**: #008080 (Teal) - Accent and highlights
- **Accent**: #FF8C00 (Gold) - Call-to-action elements
- **Neutral**: Grays for text, backgrounds, and borders

Dark mode colors are automatically provided through CSS custom properties.

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with QueryProvider
│   ├── page.tsx                # Root redirect to auth/dashboard
│   ├── auth/
│   │   └── page.tsx            # Authentication page (email + wallet)
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard with KPIs
│   ├── shipments/
│   │   └── page.tsx            # Shipment list with filtering
│   ├── tracking/
│   │   └── page.tsx            # Real-time shipment tracking
│   ├── analytics/
│   │   └── page.tsx            # Analytics and charts
│   ├── settings/
│   │   └── page.tsx            # User settings and preferences
│   ├── globals.css             # Design tokens and base styles
│   └── not-found.tsx           # 404 error page
├── components/
│   ├── atoms/                  # Basic building blocks
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── KpiCard.tsx
│   ├── molecules/              # Composite components
│   │   ├── Input.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ShipmentCard.tsx
│   │   └── StatusTimeline.tsx
│   ├── organisms/              # Complex page sections
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── TopBar.tsx          # Top navigation bar
│   │   ├── Modal.tsx           # Base modal component
│   │   └── ShipmentDetailModal.tsx
│   └── providers/
│       └── QueryProvider.tsx   # React Query setup
├── lib/
│   ├── stores/                 # Zustand stores
│   │   ├── uiStore.ts
│   │   ├── walletStore.ts
│   │   └── authStore.ts
│   ├── hooks/                  # Custom React hooks
│   │   ├── useShipments.ts
│   │   ├── useAnalytics.ts
│   │   └── useMobile.ts
│   └── utils.ts                # Utility functions
└── tailwind.config.ts          # Tailwind configuration
```

## Key Features

### Authentication
- Email/password login
- Wallet connection (Web3 integration)
- Social authentication (Google, GitHub, Twitter)
- Session management with Zustand

### Shipment Management
- Create and track shipments
- Real-time status updates
- Filter and search capabilities
- Timeline visualization
- Proof of delivery

### Analytics & Reporting
- Revenue trends and KPIs
- Shipment volume charts
- Status distribution analytics
- Top routes analysis
- Network health monitoring

### Wallet Integration
- Connect multiple wallets (MetaMask, WalletConnect, etc.)
- Balance tracking
- Transaction history
- Gas estimation
- Network switching

### User Experience
- Mobile-responsive design
- Dark mode support
- Smooth animations and transitions
- Loading states and skeletons
- Error handling
- Toast notifications (setup ready)

## State Management

### Zustand Stores

**UI Store** (`uiStore.ts`)
- Sidebar toggle
- Selected shipment tracking
- Modal state management

**Wallet Store** (`walletStore.ts`)
- Wallet connection status
- Balance management
- Transaction history

**Auth Store** (`authStore.ts`)
- User authentication
- Login/logout
- User profile data

### React Query Hooks

**useShipments** - Fetch all shipments
**useShipment** - Fetch single shipment details
**useCreateShipment** - Create new shipment mutation
**useUpdateShipment** - Update shipment mutation
**useAnalytics** - Fetch analytics data
**useShipmentStats** - Fetch shipment statistics

## Styling System

The application uses a comprehensive design token system with CSS custom properties:

```css
:root {
  --primary: #0A1F44;
  --secondary: #008080;
  --accent: #FF8C00;
  --background: #FFFFFF;
  --foreground: #0A1F44;
  --border: #E5E7EB;
  /* ... more tokens ... */
}
```

All Tailwind classes are configured to use these tokens, enabling consistent theming across light and dark modes.

## Component Architecture

### Atomic Design Pattern
- **Atoms**: Basic, reusable UI elements (Button, Badge, KpiCard)
- **Molecules**: Simple combinations of atoms (Input, StatusBadge, ShipmentCard)
- **Organisms**: Complex components combining molecules (Sidebar, TopBar, Modal)
- **Pages**: Full page compositions using organisms

## Responsive Design

Mobile-first approach with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

The sidebar is hidden on mobile (with toggle) and always visible on desktop. All components scale appropriately.

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

### First Time Setup

1. The app redirects to `/auth` for unauthenticated users
2. Sign in with email (any email/password works in mock mode)
3. Or connect a wallet
4. You'll be redirected to the dashboard

## Mock Data

The application includes comprehensive mock data:
- 3+ sample shipments with various statuses
- Analytics data with monthly trends
- Wallet mock implementation
- Network health indicators

All data is managed through React Query and can be replaced with real API calls.

## Customization

### Add New Pages

1. Create a new file in `app/[page-name]/page.tsx`
2. Use `Layout` component for consistent navigation
3. Use store hooks for state
4. Use React Query hooks for data

### Add New Components

1. Determine component level (atom/molecule/organism)
2. Create in appropriate folder
3. Follow existing patterns for styling
4. Export from component's barrel file if needed

### Modify Colors

Update `/app/globals.css` CSS custom properties to change the entire theme.

## Performance Optimizations

- Code splitting with dynamic imports
- React Query caching and stale-while-revalidate
- Image optimization with Next.js Image
- CSS-in-JS through Tailwind (no runtime cost)
- Zustand for minimal re-renders

## Security Considerations

- All auth is client-side demo
- For production: implement real authentication
- Add environment variables for API endpoints
- Enable HTTPS for wallet connections
- Validate user inputs
- Use secure session cookies

## Future Enhancements

- Real backend API integration
- Live WebSocket updates
- Push notifications
- Advanced mapping visualization
- ML-based delivery predictions
- Third-party integrations (shipping APIs)
- Blockchain integration for proof of delivery
- Mobile app version

## Contributing

This is a v0-generated starter template. Customize and extend as needed.

## License

MIT
