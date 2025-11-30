# 🎫 Sticket
## The Future of Event Ticketing on Stellar

---

# The Problem

## Traditional Ticketing is Broken

| Issue | Impact |
|-------|--------|
| 🎭 **Scalping & Fraud** | Fans pay 2-3x face value, fake tickets flood markets |
| 💸 **Hidden Fees** | 15-30% service fees hidden until checkout |
| 🔒 **No True Ownership** | Can't transfer, resell, or verify authenticity |
| 📊 **Zero Transparency** | No visibility into pricing or supply |
| ❌ **Centralized Control** | Platforms dictate rules, take massive cuts |

### The Numbers:
- **$85 billion** global ticketing market
- **$5 billion+** lost to ticket fraud annually
- **30%+** average platform fees

---

# The Solution

## Sticket: NFT Tickets on Stellar

> **Own your tickets. Trade them freely.**

A decentralized event ticketing platform where every ticket is an NFT on Stellar blockchain.

### Core Value Propositions:

```
┌─────────────────────────────────────────────────────────┐
│  ✓ 0% Platform Fees      — Organizers keep 100%        │
│  ✓ 100% Transparent      — All transactions on-chain   │
│  ✓ ∞ True Ownership      — Your wallet, your tickets   │
│  ✓ Instant Transfers     — P2P in seconds              │
│  ✓ Built-in Resale       — Secondary market included   │
└─────────────────────────────────────────────────────────┘
```

---

# How It Works

## Simple Flow for Everyone

### For Event Organizers:
```
1. Connect Freighter Wallet
2. Create Event (name, date, venue, price)
3. Deploy Smart Contract (automated)
4. Receive XLM directly on each sale
5. Track sales in real-time
```

### For Attendees:
```
1. Browse Events
2. Connect Wallet
3. Buy Ticket (pay in XLM)
4. NFT Lands in Wallet
5. Transfer/Resell Anytime
```

---

# Architecture

## Built on Stellar & Soroban

```
┌────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  Next.js 15 + React 19 + TypeScript + TailwindCSS             │
│  Freighter Wallet Integration                                  │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                     SMART CONTRACTS                            │
│  ┌──────────────────────┐    ┌───────────────────────────────┐ │
│  │   TicketFactory      │───▶│   TicketMarketplace (NFT)     │ │
│  │   ────────────────   │    │   ─────────────────────────   │ │
│  │   • Deploy events    │    │   • Mint tickets              │ │
│  │   • Track registry   │    │   • Primary/Secondary sales   │ │
│  │   • Query events     │    │   • P2P Transfers             │ │
│  └──────────────────────┘    │   • Check-in system           │ │
│                              │   • Creator royalties         │ │
│                              └───────────────────────────────┘ │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    STELLAR NETWORK                             │
│  • Soroban Smart Contracts (Rust)                             │
│  • Native XLM Payments                                        │
│  • ~5 second finality                                         │
│  • Negligible transaction fees                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                       STORAGE                                  │
│  IPFS (Pinata) — Event images & metadata                      │
└────────────────────────────────────────────────────────────────┘
```

---

# Key Features

## 🏭 Factory Contract
**Contract ID:** `CAIQBEI4GEZSNMYCPEWTGR7IYXBS4Q6GY7CDJJOTDMHDPCOIQZ2FNMRC`

| Function | Description |
|----------|-------------|
| `create_event()` | Deploy new event marketplace |
| `get_all_events()` | Query all events |
| `get_creator_events()` | Events by organizer |

## 🎟️ NFT Collection Contract
| Function | Description |
|----------|-------------|
| `mint_ticket()` | Primary sale purchase |
| `list_ticket()` | List for resale |
| `buy_secondary_ticket()` | Purchase from resale |
| `transfer_ticket()` | P2P transfer (free) |
| `mark_ticket_used()` | Event check-in |

---

# Fee Structure

## Fair for Everyone

| Transaction Type | Platform Fee | Creator Fee | Notes |
|-----------------|--------------|-------------|-------|
| **Primary Sale** | 0% | 100% to creator | Direct payment |
| **Secondary Sale** | 0% | Creator-defined % | e.g., 5% royalty |
| **P2P Transfer** | 0% | 0% | Completely free |
| **Network Fees** | ~0.00001 XLM | — | Negligible |

### Example: Concert Ticket

```
Primary Sale:
├── Ticket Price: 50 XLM
├── Platform Fee: 0 XLM
├── Creator Receives: 50 XLM ✓

Secondary Resale (5% royalty):
├── Resale Price: 75 XLM
├── Creator Royalty: 3.75 XLM
├── Seller Receives: 71.25 XLM
├── Platform Fee: 0 XLM ✓
```

---

# Why Stellar?

## The Perfect Blockchain for Ticketing

### ⚡ Speed
- **~5 second** transaction finality
- No waiting, instant ticket delivery

### 💰 Cost
- **< $0.0001** per transaction
- Makes micro-transactions viable

### 🌍 Accessibility
- Global, permissionless access
- No geographic restrictions

### 🔧 Soroban Smart Contracts
- Rust-based, secure, auditable
- Perfect for NFT ticketing logic

### 🔗 XLM Integration
- Native token payments
- No wrapped token complexity

---

# Tech Stack

## Modern, Production-Ready

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Radix UI, shadcn/ui |
| **Blockchain** | Stellar, Soroban (Rust) |
| **Wallet** | Freighter Wallet |
| **State** | TanStack Query (React Query) |
| **Storage** | IPFS via Pinata |
| **Contract Bindings** | @stellar/stellar-sdk |

---

# Data Structures

## On-Chain Ticket Data

```rust
// Each ticket is an NFT with this data
struct TicketData {
    owner: Address,      // Current owner wallet
    ticket_id: u32,      // Unique identifier
    is_used: bool,       // Event check-in status
}

// Event configuration
struct EventInfo {
    event_creator: Address,    // Organizer wallet
    total_supply: u32,         // Max tickets
    primary_price: i128,       // Price in stroops
    creator_fee_bps: u32,      // Royalty (basis points)
    event_metadata: String,    // IPFS URI
    payment_token: Address,    // XLM token address
    name: String,              // Event name
    symbol: String,            // Ticket symbol
}

// Secondary market listing
struct SecondaryListing {
    ticket_id: u32,
    seller: Address,
    price: i128,
}
```

---

# User Flow Demo

## Creating an Event

```
┌──────────────────────────────────────────────────────┐
│  CREATE EVENT                                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Event Name:    [Stellar Summit 2025          ]     │
│  Description:   [Annual blockchain conference  ]     │
│  Date:          [2025-03-15]  Time: [09:00]         │
│  Location:      [San Francisco, CA            ]     │
│  Category:      [Conference ▼]                       │
│                                                      │
│  ─────────────────────────────────────────────       │
│  Ticket Settings                                     │
│  ─────────────────────────────────────────────       │
│                                                      │
│  Total Supply:  [500    ] tickets                   │
│  Price:         [25     ] XLM                       │
│  Royalty:       [5      ] %                         │
│                                                      │
│  [ Upload Event Image ]                             │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │       🚀 CREATE EVENT ON STELLAR           │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

# User Flow Demo

## Discovering & Buying Tickets

```
┌──────────────────────────────────────────────────────┐
│  🔍 DISCOVER EVENTS                                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Music] [Sports] [Conference] [Art] [All ▼]        │
│                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  📷 Image   │ │  📷 Image   │ │  📷 Image   │   │
│  │             │ │             │ │             │   │
│  │ SELLING FAST│ │  ON SALE    │ │  SOLD OUT   │   │
│  │ Stellar     │ │ NFT Art     │ │ Tech Conf   │   │
│  │ Summit 2025 │ │ Show        │ │ 2025        │   │
│  │             │ │             │ │             │   │
│  │ 25 XLM      │ │ 10 XLM      │ │ 50 XLM      │   │
│  │ 45/500 left │ │ 200/200     │ │ 0/100       │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

# User Flow Demo

## Managing Your Tickets

```
┌──────────────────────────────────────────────────────┐
│  🎫 MY TICKETS                     [Connected: G7X...]│
├──────────────────────────────────────────────────────┤
│                                                      │
│  Active Tickets (2)                                  │
│  ─────────────────────────────────────────────       │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │  Stellar Summit 2025                       │     │
│  │  Token ID: #0047                           │     │
│  │  Status: ● ACTIVE                          │     │
│  │                                            │     │
│  │  [👁 View QR]  [📤 Send]  [💰 Sell]       │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │  NFT Art Show                              │     │
│  │  Token ID: #0123                           │     │
│  │  Status: ● ACTIVE                          │     │
│  │                                            │     │
│  │  [👁 View QR]  [📤 Send]  [💰 Sell]       │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

# Competitive Advantage

## Sticket vs Traditional Platforms

| Feature | Ticketmaster | Eventbrite | **Sticket** |
|---------|--------------|------------|-------------|
| Platform Fees | 15-30% | 3-10% | **0%** |
| Resale Freedom | Restricted | Limited | **Full** |
| True Ownership | ❌ | ❌ | **✅ NFT** |
| Transparent Pricing | ❌ | ❌ | **✅ On-chain** |
| Fraud Protection | Partial | Partial | **✅ Blockchain** |
| Creator Royalties | ❌ | ❌ | **✅ Automatic** |
| Global Access | Limited | Limited | **✅ Borderless** |

---

# Roadmap

## Building the Future

### ✅ Phase 1: MVP (Complete)
- [x] Smart contract architecture
- [x] Factory + NFT contracts deployed to Testnet
- [x] Frontend with wallet integration
- [x] Event creation flow
- [x] Ticket purchase flow
- [x] IPFS metadata storage

### 🔄 Phase 2: Enhancement (In Progress)
- [ ] Secondary marketplace UI
- [ ] QR code check-in system
- [ ] Event search & filtering
- [ ] Mobile-responsive optimization

### 🔜 Phase 3: Mainnet (Q1 2025)
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Performance optimization
- [ ] Analytics dashboard

### 🌟 Phase 4: Scale (Q2 2025)
- [ ] Multi-token payments
- [ ] Batch ticket purchases
- [ ] API for venue integrations
- [ ] Mobile app (PWA)

---

# Use Cases

## Beyond Traditional Events

### 🎵 Concerts & Festivals
- Fair ticket distribution
- Artist royalties on resales
- VIP tier management

### 🏀 Sports Events
- Season passes as NFT collections
- Exclusive holder benefits
- Authentic memorabilia proof

### 🎤 Conferences & Meetups
- Verifiable attendance records
- Networking credential NFTs
- Speaker access passes

### 🎭 Exclusive Experiences
- Limited edition events
- Membership-gated access
- Collectible event tickets

---

# Business Model

## Sustainable & Fair

### For Organizers (Free):
- **$0** to create events
- **$0** platform cut on sales
- Full control over pricing

### Revenue Opportunities:
1. **Premium Features** (Future)
   - Analytics dashboard
   - Marketing tools
   - API access

2. **Enterprise Solutions** (Future)
   - White-label deployment
   - Custom integrations
   - SLA support

3. **Network Growth**
   - Ecosystem building now
   - Monetize at scale later

---

# Security

## Built for Trust

### Smart Contract Security:
- Written in Rust (memory-safe)
- Soroban's built-in safeguards
- Authorization on all critical functions

### Ticket Protection:
- NFT ownership = ticket ownership
- Cannot duplicate or forge
- On-chain transfer history

### User Security:
- Non-custodial (users control keys)
- Freighter wallet integration
- No sensitive data stored

### Planned:
- [ ] Professional audit
- [ ] Bug bounty program
- [ ] Formal verification

---

# The Team

## Building Sticket

[Add team member information here]

### Contact:
- **GitHub:** [github.com/sticket]
- **Twitter:** [@sticket_xyz]
- **Email:** hello@sticket.xyz

---

# Demo

## Live on Stellar Testnet

### Try It Now:
1. Install [Freighter Wallet](https://freighter.app)
2. Switch to Testnet
3. Get test XLM from [Stellar Laboratory](https://laboratory.stellar.org)
4. Visit: **[Your Demo URL]**

### Contract Addresses:
```
Factory: CAIQBEI4GEZSNMYCPEWTGR7IYXBS4Q6GY7CDJJOTDMHDPCOIQZ2FNMRC
Network: Stellar Testnet
```

---

# Summary

## Why Sticket Wins

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   🎫 NFT Tickets on Stellar                           │
│                                                        │
│   ✓ Zero platform fees                                │
│   ✓ True ticket ownership                             │
│   ✓ Instant P2P transfers                             │
│   ✓ Built-in secondary market                         │
│   ✓ Creator royalties                                 │
│   ✓ Fraud-proof verification                          │
│   ✓ Global, borderless access                         │
│                                                        │
│   Built on Stellar • Fast • Cheap • Scalable         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

# Thank You!

## Own Your Tickets. Trade Them Freely.

### 🌟 Sticket — The Future of Event Ticketing

**Questions?**

[Demo] • [GitHub] • [Twitter]

---

*Built with ❤️ on Stellar*

