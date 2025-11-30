# UI vs Smart Contract Gap Analysis

## Overview

This document compares the frontend UI implementation with the Soroban smart contracts to identify:

- ✅ Features aligned between UI and contracts
- ⚠️ UI features missing contract support
- ❌ Contract features missing UI implementation
- 🔧 Integration work needed

---

## 📊 Feature Comparison Matrix

### Event Creation

| Feature               | UI                      | Contract                     | Status                     |
| --------------------- | ----------------------- | ---------------------------- | -------------------------- |
| Event name            | ✅                      | ✅ `name`                    | ✅ Aligned                 |
| Event symbol          | ❌                      | ✅ `symbol`                  | ❌ **Missing in UI**       |
| Total supply          | ✅ `maxSupply`          | ✅ `total_supply`            | ✅ Aligned                 |
| Primary price         | ✅ `primaryPrice`       | ✅ `primary_price`           | ✅ Aligned                 |
| Creator fee (royalty) | ✅ `secondaryMarketFee` | ✅ `creator_fee_bps`         | ✅ Aligned                 |
| Creator address       | ✅ `creatorAddress`     | ✅ `event_creator`           | ✅ Aligned                 |
| Event metadata        | ✅ (structured)         | ✅ `event_metadata` (string) | 🔧 **Needs serialization** |
| Payment token         | ❌                      | ✅ `payment_token`           | ❌ **Missing in UI**       |
| Salt for deployment   | ❌                      | ✅ `salt`                    | 🔧 **Auto-generate**       |
| Platform fee          | ✅ `createFeeBps`       | ❌                           | ⚠️ **Not in contract**     |
| Event description     | ✅                      | → `event_metadata`           | 🔧 Serialize to metadata   |
| Event date/time       | ✅                      | → `event_metadata`           | 🔧 Serialize to metadata   |
| Event location        | ✅                      | → `event_metadata`           | 🔧 Serialize to metadata   |
| Event category        | ✅                      | → `event_metadata`           | 🔧 Serialize to metadata   |
| Event image           | ✅ (IPFS)               | → `event_metadata`           | 🔧 Serialize to metadata   |
| Contact info          | ✅                      | → `event_metadata`           | 🔧 Serialize to metadata   |

### Primary Market (Minting)

| Feature                | UI       | Contract                     | Status                     |
| ---------------------- | -------- | ---------------------------- | -------------------------- |
| Buy ticket             | ✅ Modal | ✅ `mint_ticket(buyer)`      | 🔧 **Need integration**    |
| Quantity selector      | ✅       | ❌ (1 per call)              | ⚠️ **Loop multiple calls** |
| Show available tickets | ✅       | ✅ `get_tickets_available()` | 🔧 Need integration        |
| Show tickets minted    | ❌       | ✅ `get_tickets_minted()`    | ❌ **Missing in UI**       |

### Secondary Market

| Feature               | UI                       | Contract                                                | Status                            |
| --------------------- | ------------------------ | ------------------------------------------------------- | --------------------------------- |
| List ticket for sale  | ✅ `SellTicketModal`     | ✅ `list_ticket(seller, ticket_id, price)`              | 🔧 **Need integration**           |
| Buy from secondary    | ✅ `BuyTicketModal`      | ✅ `buy_secondary_ticket(buyer, ticket_id)`             | 🔧 **Need integration**           |
| Delist/Cancel listing | ✅ `CancelListingParams` | ✅ `delist_ticket(seller, ticket_id)`                   | 🔧 **Need integration**           |
| Update listing price  | ❌                       | ✅ `update_listing_price(seller, ticket_id, new_price)` | ❌ **Missing in UI**              |
| Get all listings      | ✅ (mock)                | ✅ `get_all_secondary_listings()`                       | 🔧 **Need integration**           |
| Get single listing    | ❌                       | ✅ `get_secondary_listing(ticket_id)`                   | 🔧 For detail view                |
| Floor price calc      | ✅ (client)              | ❌                                                      | ✅ Keep on client                 |
| Avg price calc        | ✅ (client)              | ❌                                                      | ✅ Keep on client                 |
| Listing expiration    | ✅ `expiresAt`           | ❌                                                      | ⚠️ **Not in contract**            |
| Currency selection    | ✅ XLM/USDC              | ❌ (payment_token fixed)                                | ⚠️ **Contract uses single token** |

### Ticket Management

| Feature               | UI                    | Contract                                  | Status                  |
| --------------------- | --------------------- | ----------------------------------------- | ----------------------- |
| View my tickets       | ✅ `/tickets`         | ✅ `get_user_tickets(user)`               | 🔧 **Need integration** |
| Transfer ticket (P2P) | ✅ `SendTicketModal`  | ✅ `transfer_ticket(from, to, ticket_id)` | 🔧 **Need integration** |
| View ticket details   | ✅ `ViewTicketModal`  | ✅ `get_ticket(ticket_id)`                | 🔧 **Need integration** |
| Mark ticket used      | ❌                    | ✅ `mark_ticket_used(creator, ticket_id)` | ❌ **Missing in UI**    |
| Download ticket       | ✅                    | N/A (client-side)                         | ✅ Client only          |
| Generate QR code      | ✅                    | N/A (client-side)                         | ✅ Client only          |
| Transfer history      | ✅ `TransferRecord[]` | ❌ (no on-chain history)                  | ⚠️ **Need indexer**     |

### Event Discovery

| Feature            | UI                  | Contract                                 | Status                      |
| ------------------ | ------------------- | ---------------------------------------- | --------------------------- |
| List all events    | ✅ `/discover`      | ✅ `Factory.get_all_events()`            | 🔧 **Need integration**     |
| Get event by ID    | ✅ `/discover/[id]` | ✅ `Factory.get_event(event_id)`         | 🔧 **Need integration**     |
| Get event info     | ✅ (mock)           | ✅ `get_event_info()`                    | 🔧 **Need integration**     |
| Get creator events | ❌                  | ✅ `Factory.get_creator_events(creator)` | ❌ **Missing in UI**        |
| Event count        | ❌                  | ✅ `Factory.get_event_count()`           | 🔧 For stats                |
| Search/Filter      | ✅ (mock)           | ❌                                       | ⚠️ **Need off-chain index** |
| Category filter    | ✅                  | ❌ (in metadata)                         | ⚠️ **Need off-chain index** |

### Admin / Creator Features

| Feature                | UI  | Contract                                  | Status               |
| ---------------------- | --- | ----------------------------------------- | -------------------- |
| Check-in attendee      | ❌  | ✅ `mark_ticket_used(creator, ticket_id)` | ❌ **Missing in UI** |
| View my created events | ❌  | ✅ `get_creator_events(creator)`          | ❌ **Missing in UI** |
| Creator dashboard      | ❌  | (various queries)                         | ❌ **Missing in UI** |

---

## ⚠️ UI Features NOT Supported by Contract

These features exist in the UI but have no contract backing:

| UI Feature               | Location                        | Issue                                | Recommendation                            |
| ------------------------ | ------------------------------- | ------------------------------------ | ----------------------------------------- |
| **Platform fee**         | `createFeeBps` in form          | Contract only has `creator_fee_bps`  | Add to contract or remove from UI         |
| **Listing expiration**   | `SellTicketParams.expiresAt`    | Contract has no expiration           | Add to contract or handle off-chain       |
| **Multi-currency**       | XLM/USDC toggle                 | Contract uses single `payment_token` | Deploy separate contracts or extend       |
| **Seller rating**        | `SecondaryListing.sellerRating` | No on-chain reputation               | Build off-chain reputation system         |
| **Transfer history**     | `Ticket.transferHistory`        | Not tracked on-chain                 | Build indexer from events                 |
| **Ticket expiration**    | `Ticket.expiresAt`              | Not in contract                      | Add to contract or derive from event date |
| **"EXPIRED" status**     | `TicketStatus`                  | Contract only has `is_used`          | Derive from event date                    |
| **"TRANSFERRED" status** | `TicketStatus`                  | Contract only tracks owner           | Remove or track differently               |

---

## ❌ Contract Features Missing from UI

| Contract Feature            | Method                    | Priority  | Action Needed                     |
| --------------------------- | ------------------------- | --------- | --------------------------------- |
| **Event symbol input**      | `create_event(...symbol)` | 🔴 High   | Add field to create form          |
| **Payment token selection** | `init(...payment_token)`  | 🔴 High   | Add token selector                |
| **Update listing price**    | `update_listing_price()`  | 🟡 Medium | Add edit button to listings       |
| **Check-in/Mark used**      | `mark_ticket_used()`      | 🔴 High   | Create check-in page for creators |
| **My created events**       | `get_creator_events()`    | 🟡 Medium | Add creator dashboard             |
| **Tickets minted count**    | `get_tickets_minted()`    | 🟢 Low    | Show on event page                |

---

## 🔧 Integration Work Needed

### 1. Event Metadata Serialization

**Problem:** UI has structured metadata, contract expects single string.

**Solution:** Serialize to JSON before contract call:

```typescript
// UI EventMetadata
interface EventMetadata {
  description: string;
  dateTime: string;
  locationAddress: string;
  category: string;
  image: string; // IPFS URL
  contact: string;
  secondaryMarketFee: number;
}

// Serialize for contract
const eventMetadata = JSON.stringify({
  description,
  dateTime: dateTime.toISOString(),
  location: locationAddress,
  category,
  image: ipfsUrl,
  contact,
});

// Call contract
factory.create_event(
  salt,
  creatorAddress,
  maxSupply,
  primaryPrice,
  secondaryMarketFee * 100, // Convert % to bps
  eventMetadata, // JSON string
  name,
  symbol // Need to add to UI
);
```

### 2. Multi-Ticket Purchase

**Problem:** UI allows quantity > 1, contract mints 1 at a time.

**Solution:** Loop and batch:

```typescript
async function buyTickets(quantity: number) {
  const txs = [];
  for (let i = 0; i < quantity; i++) {
    txs.push(marketplace.mint_ticket(buyerAddress));
  }
  // Execute sequentially or batch
  await Promise.all(txs);
}
```

### 3. Status Derivation

**Problem:** UI has more statuses than contract.

**Solution:** Derive from contract data:

```typescript
function deriveTicketStatus(
  ticket: ContractTicket,
  event: EventInfo
): UIStatus {
  if (ticket.is_used) return "USED";
  if (isListed(ticket.ticket_id)) return "LISTED";
  if (new Date(event.date) < new Date()) return "EXPIRED";
  return "ACTIVE";
}
```

### 4. Off-Chain Indexer Needed

For features not available on-chain:

- Search/filter events by category
- Transfer history tracking
- Price history
- Seller reputation

**Recommendation:** Build indexer that:

1. Listens to contract events
2. Stores in PostgreSQL/Redis
3. Exposes REST/GraphQL API

---

## 📋 Implementation Priority

### Phase 1: Core Integration (Must Have)

1. ✅ Connect wallet (Freighter) - Done
2. 🔧 Create event → `Factory.create_event()`
3. 🔧 Mint ticket → `Marketplace.mint_ticket()`
4. 🔧 List ticket → `Marketplace.list_ticket()`
5. 🔧 Buy secondary → `Marketplace.buy_secondary_ticket()`
6. 🔧 Transfer ticket → `Marketplace.transfer_ticket()`
7. 🔧 Fetch user tickets → `Marketplace.get_user_tickets()`
8. 🔧 Fetch event info → `Marketplace.get_event_info()`

### Phase 2: Creator Features

1. ❌ Add check-in page (`mark_ticket_used`)
2. ❌ Add creator dashboard (`get_creator_events`)
3. 🔧 Show tickets minted/available

### Phase 3: Enhanced Features

1. ❌ Add update listing price UI
2. 🔧 Build off-chain indexer
3. 🔧 Add search/filter with indexer
4. ⚠️ Decide on platform fee (contract change?)

---

## 📝 Recommended Contract Additions

If contract can be modified:

```rust
// 1. Add platform fee
struct EventInfo {
    // ... existing fields
    platform_fee_bps: u32,     // Platform's cut
    platform_address: Address, // Where platform fee goes
}

// 2. Add listing expiration
struct SecondaryListing {
    ticket_id: u32,
    seller: Address,
    price: i128,
    expires_at: Option<u64>,  // Unix timestamp
}

// 3. Add event timestamp
struct EventInfo {
    // ... existing fields
    event_date: u64,  // For expiration logic
}
```

---

## Summary

| Category          | Aligned | UI Only | Contract Only |
| ----------------- | ------- | ------- | ------------- |
| Event Creation    | 6       | 2       | 2             |
| Primary Market    | 2       | 1       | 1             |
| Secondary Market  | 5       | 3       | 1             |
| Ticket Management | 4       | 4       | 1             |
| Discovery         | 2       | 2       | 2             |
| Admin             | 0       | 0       | 2             |
| **Total**         | **19**  | **12**  | **9**         |

**Key Takeaways:**

- 🔧 19 features need contract integration
- ⚠️ 12 UI features need contract support or removal
- ❌ 9 contract features need UI implementation
- 🔴 Priority: Check-in page, symbol field, payment token selector
