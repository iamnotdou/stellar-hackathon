# Stellar Ticket Marketplace - Contract Documentation

## Overview

This repository contains two Soroban smart contracts for a decentralized ticket marketplace:

1. **TicketFactory** - A factory contract that deploys and manages ticket/event NFT collections
2. **TicketMarketplace** - An NFT ticket contract with primary sales, secondary marketplace, and event check-in

---

## 🏭 TicketFactory Contract

A factory contract that deploys and manages ticket/event NFT collections.

### Methods

| Method | Description |
|--------|-------------|
| `initialize(wasm_hash)` | Set up the factory with the NFT contract WASM hash |
| `create_event(salt, event_creator, total_supply, primary_price, creator_fee_bps, event_metadata, name, symbol)` | Deploy a new ticket marketplace for an event |
| `get_event(event_id)` | Get details of a specific event by ID |
| `get_creator_events(creator)` | Get all events created by a specific address |
| `get_all_events()` | List all events created through the factory |
| `get_event_count()` | Get total number of events created |
| `get_wasm_hash()` | Get the stored NFT contract WASM hash |

### Method Details

#### `initialize`
```
initialize(wasm_hash: BytesN<32>)
```
Initializes the factory with the ticket contract WASM hash. Must be called once before creating events.

#### `create_event`
```
create_event(
    salt: BytesN<32>,
    event_creator: Address,
    total_supply: u32,
    primary_price: i128,
    creator_fee_bps: u32,
    event_metadata: String,
    name: String,
    symbol: String
) -> Address
```
Deploys a new TicketMarketplace contract for an event. Returns the deployed contract address.

- `salt` - Unique salt for deterministic contract address
- `event_creator` - Address of the event organizer
- `total_supply` - Maximum number of tickets
- `primary_price` - Price per ticket in primary sale
- `creator_fee_bps` - Creator fee on secondary sales (basis points, 500 = 5%)
- `event_metadata` - Event description or metadata URI
- `name` - Event/collection name
- `symbol` - Ticket symbol

---

## 🎟️ TicketMarketplace Contract

An NFT ticket contract with primary sales, secondary marketplace, and event check-in.

### Initialization

| Method | Description |
|--------|-------------|
| `init(event_creator, total_supply, primary_price, creator_fee_bps, event_metadata, payment_token, name, symbol)` | Initialize a new ticket collection |

### Primary Market (Minting)

| Method | Description |
|--------|-------------|
| `mint_ticket(buyer)` | Buy a ticket from primary sale (pays `primary_price` to creator) |

### Secondary Marketplace

| Method | Description |
|--------|-------------|
| `list_ticket(seller, ticket_id, price)` | List a ticket for resale |
| `buy_secondary_ticket(buyer, ticket_id)` | Buy a listed ticket (creator gets fee %) |
| `delist_ticket(seller, ticket_id)` | Remove ticket from secondary market |
| `update_listing_price(seller, ticket_id, new_price)` | Change the price of a listed ticket |

### Ticket Management

| Method | Description |
|--------|-------------|
| `transfer_ticket(from, to, ticket_id)` | Direct P2P ticket transfer (no fee) |
| `mark_ticket_used(creator, ticket_id)` | Check-in a ticket at the event (only creator can call) |

### Query Functions

| Method | Description |
|--------|-------------|
| `name()` | Get event/collection name |
| `symbol()` | Get ticket symbol |
| `get_ticket(ticket_id)` | Get ticket details (owner, used status) |
| `get_event_info()` | Get full event configuration |
| `get_user_tickets(user)` | Get all ticket IDs owned by a user |
| `get_secondary_listing(ticket_id)` | Get listing details for a ticket |
| `get_all_secondary_listings()` | Get all active secondary listings |
| `get_tickets_minted()` | Total tickets sold so far |
| `get_tickets_available()` | Remaining tickets in primary sale |

---

## 📊 Data Structures

### TicketData
```rust
struct TicketData {
    owner: Address,      // Current owner
    ticket_id: u32,      // Unique ID
    is_used: bool,       // Used at event?
}
```

### EventInfo
```rust
struct EventInfo {
    event_creator: Address,    // Who created the event
    total_supply: u32,         // Max tickets
    primary_price: i128,       // Price in tokens
    creator_fee_bps: u32,      // Secondary sale fee (basis points, 500 = 5%)
    event_metadata: String,    // Event description/URI
    payment_token: Address,    // Token used for payments
    name: String,              // Event name
    symbol: String,            // Ticket symbol
}
```

### SecondaryListing
```rust
struct SecondaryListing {
    ticket_id: u32,
    seller: Address,
    price: i128,
}
```

### EventRecord (Factory)
```rust
struct EventRecord {
    event_contract: Address,
    event_creator: Address,
    name: String,
    symbol: String,
    created_at: u64,
}
```

---

## 🔄 Usage Flows

### Create & Sell Tickets
```
1. Factory.initialize(wasm_hash)          → Set up factory
2. Factory.create_event(...)              → Deploy new TicketMarketplace
3. User calls mint_ticket(buyer)          → Pay creator, receive ticket
4. User calls list_ticket(seller, id, price) → List for resale
5. Buyer calls buy_secondary_ticket(...)  → Seller gets (price - fee), creator gets fee
```

### Event Check-in
```
1. Attendee arrives at venue
2. Creator calls mark_ticket_used(creator, ticket_id)
3. Ticket is marked as used, cannot be resold or transferred
```

### P2P Transfer
```
1. Owner calls transfer_ticket(from, to, ticket_id)
2. Ticket ownership transfers directly (no fees)
3. Note: Cannot transfer if ticket is listed for sale
```

---

## 💰 Fee Structure

| Transaction Type | Fee Distribution |
|-----------------|------------------|
| **Primary Sale** | 100% to `event_creator` |
| **Secondary Sale** | `creator_fee_bps / 10000` to creator, remainder to seller |
| **P2P Transfer** | No fees |

### Example
- `creator_fee_bps = 500` (5%)
- Secondary sale price: 1000 tokens
- Creator receives: 50 tokens
- Seller receives: 950 tokens

---

## 🚀 Deployment

### Prerequisites
```bash
# Install Stellar CLI
brew install stellar-cli

# Generate deployer key
stellar keys generate --global deployer --network testnet

# Fund account
stellar keys fund deployer --network testnet
```

### Build
```bash
cd contracts/hello-world
stellar contract build
```

### Deploy
```bash
# 1. Install WASM and get hash
stellar contract install \
  --network testnet \
  --source deployer \
  --wasm target/wasm32v1-none/release/hello_world.wasm

# 2. Deploy factory contract
stellar contract deploy \
  --network testnet \
  --source deployer \
  --wasm target/wasm32v1-none/release/hello_world.wasm

# 3. Initialize factory with WASM hash
stellar contract invoke \
  --network testnet \
  --source deployer \
  --id <CONTRACT_ID> \
  -- \
  initialize \
  --wasm_hash <WASM_HASH>
```

### Create an Event
```bash
stellar contract invoke \
  --network testnet \
  --source deployer \
  --id <FACTORY_CONTRACT_ID> \
  -- \
  create_event \
  --salt 0000000000000000000000000000000000000000000000000000000000000001 \
  --event_creator <YOUR_ADDRESS> \
  --total_supply 100 \
  --primary_price 10000000 \
  --creator_fee_bps 500 \
  --event_metadata "My Concert 2025" \
  --name "Concert Tickets" \
  --symbol "TKT"
```

---

## 🔐 Authorization

| Action | Required Auth |
|--------|---------------|
| Create event | `event_creator` |
| Mint ticket | `buyer` |
| List ticket | `seller` (must be owner) |
| Buy secondary | `buyer` |
| Delist ticket | `seller` |
| Transfer ticket | `from` (must be owner) |
| Mark used | `event_creator` only |

---

## 📝 Notes

- Tickets cannot be transferred or resold once marked as used
- Listed tickets cannot be transferred until delisted
- All payments use a configurable `payment_token` (e.g., USDC, XLM)
- Creator fee is enforced on all secondary sales

