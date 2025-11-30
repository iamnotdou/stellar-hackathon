# Sticket 🎫

> **The first truly transparent ticketing platform powered by Stellar**

Sticket is a decentralized NFT ticketing platform built on the Stellar blockchain. Buy, sell, and transfer event tickets as NFTs — no middlemen, no hidden fees, full ownership.

![Sticket Banner](public/bg.png)

## ✨ Features

- **🔒 Secure & Verifiable** — Every ticket exists on Stellar — immutable, transparent, and linked to its rightful owner
- **🔄 Transfer or Trade Freely** — Users can transfer or resell tickets directly through their wallets — no hidden commissions
- **📊 Event Manager Dashboard** — Organizers can create events, set prices, define rules, and track ticket sales in real-time
- **👛 Seamless Wallet Integration** — Supports Freighter wallet — mint, buy, and check in with one click
- **🏪 Secondary Marketplace** — Built-in secondary market for ticket resales with creator royalties

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Blockchain**: Stellar/Soroban Smart Contracts
- **Wallet**: Freighter Wallet Integration
- **Storage**: IPFS via Pinata for metadata and images
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI, shadcn/ui

## 📁 Project Structure

```
sticket/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── create/             # Event creation page
│   │   ├── discover/           # Event discovery & details
│   │   ├── tickets/            # User's tickets page
│   │   └── api/                # API routes for uploads
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── tickets/            # Ticket-related components
│   │   ├── marketplace/        # Secondary market components
│   │   └── layouts/            # Layout components
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-all-events.ts   # Fetch all events
│   │   ├── use-event-details.ts# Fetch event details
│   │   ├── use-user-tickets.ts # Fetch user's tickets
│   │   └── use-create-event.ts # Create new events
│   ├── providers/              # Context providers
│   │   ├── FreighterProvider.tsx
│   │   └── QueryProvider.tsx
│   └── lib/                    # Utilities
├── packages/
│   ├── sticket-factory/        # Factory contract bindings
│   └── sticket-nft-collections/# NFT contract bindings
└── public/                     # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- [Freighter Wallet](https://www.freighter.app/) browser extension
- Stellar Testnet XLM (for testing)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/sticket.git
   cd sticket
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Add your Pinata API keys:

   ```env
   PINATA_JWT=your_pinata_jwt_token
   NEXT_PUBLIC_GATEWAY_URL=https://gateway.pinata.cloud
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Connecting to Stellar Testnet

1. Install [Freighter Wallet](https://www.freighter.app/)
2. Create or import a wallet
3. Switch to **Testnet** in Freighter settings
4. Get testnet XLM from [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)

## 📜 Smart Contracts

Sticket uses two Soroban smart contracts deployed on Stellar Testnet:

### Factory Contract

- **Contract ID**: `CAIQBEI4GEZSNMYCPEWTGR7IYXBS4Q6GY7CDJJOTDMHDPCOIQZ2FNMRC`
- Creates and manages event contracts
- Tracks all events in the system

### NFT Collections Contract

- Each event deploys its own NFT collection contract
- Handles ticket minting, transfers, and secondary sales
- Manages royalties and creator fees

## 🎯 Core Features

### For Event Organizers

- **Create Events** — Set up events with name, description, date, location, and ticket details
- **Set Pricing** — Define primary ticket price in XLM
- **Creator Royalties** — Earn fees from secondary market sales
- **Track Sales** — Monitor ticket sales and availability in real-time

### For Attendees

- **Discover Events** — Browse and search for upcoming events
- **Buy Tickets** — Purchase tickets directly with XLM
- **Own Your Tickets** — Tickets are NFTs in your wallet
- **Transfer & Resell** — Send tickets to friends or list on secondary market

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Build
npm run build        # Build for production

# Production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🌐 Network Configuration

The app is configured to use Stellar Testnet by default:

```typescript
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
```

## 📱 Pages

| Page          | Path             | Description                          |
| ------------- | ---------------- | ------------------------------------ |
| Home          | `/`              | Landing page with featured events    |
| Discover      | `/discover`      | Browse all events                    |
| Event Details | `/discover/[id]` | View event details and buy tickets   |
| Create Event  | `/create`        | Create a new event (requires wallet) |
| My Tickets    | `/tickets`       | View owned tickets (requires wallet) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Stellar](https://stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [Freighter Wallet](https://www.freighter.app/)
- [Pinata IPFS](https://www.pinata.cloud/)

---

<p align="center">
  Built with ❤️ on <a href="https://stellar.org">Stellar</a>
</p>
