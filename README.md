# Supply Chain Protocol

A decentralized supply chain visibility and coordination protocol built on Soroban.

## Architecture

- **Frontend**: Next.js + TypeScript
- **Backend**: Rust
- **Smart Contracts**: Rust + Soroban
- **Blockchain**: Stellar/Soroban

## Project Structure

```
├── frontend/          # Next.js frontend application
├── backend/           # Rust API server
├── contracts/         # Soroban smart contracts
├── docs/             # Protocol documentation
└── scripts/          # Development and deployment scripts
```

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development:
   ```bash
   npm run dev
   ```

## Development

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && cargo run`
- Contracts: `cd contracts && make build`

## Protocol Layers

1. **Visibility Layer** - Append-only event log
2. **Interoperability Standard** - Canonical data schema
3. **ZK Attestations** - Privacy-preserving compliance
4. **Programmable Settlement** - Automated payments
5. **Resilience Graph** - Network risk analysis
