# Sticket: UI ↔ Smart Contract Gap Analysis

> Last Updated: November 30, 2024

## Overview

This document identifies gaps between the UI implementation and Smart Contract capabilities.

---

## 📊 Summary

| Category             | Total Methods | Used in UI | Not Used | Coverage |
| -------------------- | ------------- | ---------- | -------- | -------- |
| **Factory Contract** | 7             | 7          | 0        | 100%     |
| **NFT Contract**     | 17            | 13         | 4        | 76%      |
| **UI Features**      | 15            | 13         | 2        | 87%      |

---

## 🔴 Smart Contract Methods NOT Used in UI

### Factory Contract (`sticket-factory`) ✅ ALL IMPLEMENTED

| Method               | Description            | Status         | Notes                             |
| -------------------- | ---------------------- | -------------- | --------------------------------- |
| `get_event`          | Get single event by ID | 🟡 Not Used    | Could optimize event detail page  |
| `get_event_count`    | Total events count     | ✅ Implemented | Used in homepage + discover stats |
| `get_creator_events` | Events by creator      | ✅ Implemented | Used in `/my-events` dashboard    |

### NFT Collections Contract (`sticket-nft-collections`)

| Method                  | Description              | Status         | Notes                              |
| ----------------------- | ------------------------ | -------------- | ---------------------------------- |
| `mark_ticket_used`      | Check-in ticket at event | ✅ Implemented | Used in `/check-in/[eventId]`      |
| `name`                  | Get event name           | 🟢 Low         | Already have from `get_event_info` |
| `symbol`                | Get ticket symbol        | 🟢 Low         | Already have from `get_event_info` |
| `init`                  | Initialize contract      | ⚪ N/A         | Called by factory, not UI          |
| `get_secondary_listing` | Get single listing       | 🟡 Not Used    | Could optimize buy flow            |

---

## 🟡 UI Features WITHOUT Smart Contract Data

### Missing Data Connections

| UI Feature          | Location               | Issue                    | Solution                                       |
| ------------------- | ---------------------- | ------------------------ | ---------------------------------------------- |
| **Event Date/Time** | Discover, Event Detail | Hardcoded/Metadata only  | ✅ Stored in IPFS metadata                     |
| **Event Location**  | Discover, Event Detail | Hardcoded/Metadata only  | ✅ Stored in IPFS metadata                     |
| **Event Category**  | Create Event, Filters  | UI only, no chain filter | Add category to contract or filter client-side |
| **Ticket QR Code**  | My Tickets             | Generated locally        | Need QR verification system                    |
| **Activity Feed**   | Homepage               | Simulated data           | Need event indexer/subgraph                    |
| **Search**          | Discover page          | Not implemented          | Client-side or indexer                         |

### UI Components Ready, No Backend

| Component         | File                                 | Status      | Needs                                  |
| ----------------- | ------------------------------------ | ----------- | -------------------------------------- |
| `ViewTicketModal` | `tickets/modals/ViewTicketModal.tsx` | ✅ UI Ready | QR generation works                    |
| `SendTicketModal` | `tickets/modals/SendTicketModal.tsx` | ✅ UI Ready | ✅ Connected to `transfer_ticket`      |
| `SellTicketModal` | `tickets/modals/SellTicketModal.tsx` | ✅ UI Ready | ✅ Connected to `list_ticket`          |
| `BuyTicketModal`  | `marketplace/BuyTicketModal.tsx`     | ✅ UI Ready | ✅ Connected to `buy_secondary_ticket` |
| `SecondaryMarket` | `marketplace/SecondaryMarket.tsx`    | ✅ UI Ready | ✅ Connected to listings               |

---

## 🔴 Critical Missing Features

### 1. Event Check-In System (Creator Dashboard)

**Smart Contract:** `mark_ticket_used(creator, ticket_id)` ✅ EXISTS

**UI Needed:**

```
/creator/[eventId]/check-in
├── QR Scanner component
├── Ticket validation display
├── Mark as used button
└── Attendance statistics
```

**Implementation:**

```typescript
// Hook needed: use-check-in.ts
const markTicketUsed = async (ticketId: number) => {
  const client = createNftClient(eventContract, publicKey, signTransaction);
  const tx = await client.mark_ticket_used({
    creator: publicKey,
    ticket_id: ticketId,
  });
  await tx.signAndSend();
};
```

---

### 2. My Events Dashboard (Creator View)

**Smart Contract:** `get_creator_events(creator)` ✅ EXISTS

**UI Needed:**

```
/my-events (or /creator)
├── List of created events
├── Sales statistics per event
├── Revenue tracking
├── Quick actions (check-in, edit)
└── Earnings withdrawal (if applicable)
```

**Implementation:**

```typescript
// Hook needed: use-creator-events.ts
export function useCreatorEvents(creatorAddress: string) {
  return useQuery({
    queryKey: ["creator-events", creatorAddress],
    queryFn: async () => {
      const client = createFactoryClient();
      const tx = await client.get_creator_events({ creator: creatorAddress });
      const result = await tx.simulate();
      return result.result as EventRecord[];
    },
    enabled: !!creatorAddress,
  });
}
```

---

### 3. Event Statistics Display

**Smart Contract:** `get_event_count()` ✅ EXISTS

**UI Location:** Homepage stats, admin dashboard

**Currently:** Counting from `get_all_events()` length
**Better:** Direct `get_event_count()` call

---

## 🟢 Fully Implemented Features

| Feature               | UI               | Contract Method              | Status      |
| --------------------- | ---------------- | ---------------------------- | ----------- |
| Create Event          | `/create`        | `create_event`               | ✅ Complete |
| Browse Events         | `/discover`      | `get_all_events`             | ✅ Complete |
| Event Details         | `/discover/[id]` | `get_event_info`             | ✅ Complete |
| Buy Primary Ticket    | Event page       | `mint_ticket`                | ✅ Complete |
| View My Tickets       | `/tickets`       | `get_user_tickets`           | ✅ Complete |
| Transfer Ticket       | Ticket modal     | `transfer_ticket`            | ✅ Complete |
| List for Sale         | Ticket modal     | `list_ticket`                | ✅ Complete |
| Update Price          | Ticket modal     | `update_listing_price`       | ✅ Complete |
| Cancel Listing        | Ticket modal     | `delist_ticket`              | ✅ Complete |
| Buy Secondary         | Event page       | `buy_secondary_ticket`       | ✅ Complete |
| View Secondary Market | Event page       | `get_all_secondary_listings` | ✅ Complete |
| Ticket Availability   | Event page       | `get_tickets_available`      | ✅ Complete |
| Tickets Minted        | Event page       | `get_tickets_minted`         | ✅ Complete |

---

## 📋 Implementation Priority

### Phase 1: Critical (Must Have) ✅ COMPLETED

1. ✅ **Check-In System** - `mark_ticket_used`
   - Scanner page for creators (`/check-in/[eventId]`)
   - Ticket validation UI
   - Manual ticket ID entry
2. ✅ **Creator Dashboard** - `get_creator_events`
   - My events list (`/my-events`)
   - Revenue tracking
   - Quick actions (view event, check-in)

### Phase 2: Important (Should Have) ✅ COMPLETED

3. ✅ **Event Search & Filters**
   - Client-side filtering by category
   - Text search on name/description
4. ⬜ **Real Activity Feed**
   - Event indexer or polling
   - WebSocket for real-time

### Phase 3: Nice to Have ✅ PARTIALLY COMPLETED

5. ✅ **Analytics Dashboard**
   - `get_event_count` integration (in homepage + discover)
   - Sales graphs (basic stats in My Events page)
6. ⬜ **Optimized Single Event Fetch**
   - Use `get_event` instead of filtering all

---

## 🛠️ Quick Wins

### 1. Add Event Count to Stats (5 min)

```typescript
// In use-all-events.ts or new hook
const { data: eventCount } = useQuery({
  queryKey: ["event-count"],
  queryFn: async () => {
    const client = createFactoryClient();
    const tx = await client.get_event_count();
    const result = await tx.simulate();
    return result.result as number;
  },
});
```

### 2. Add "My Events" Link (10 min)

- Add to Header navigation
- Only show if wallet connected
- Link to `/my-events` (page to be created)

### 3. Category Filter on Discover (15 min)

- Categories stored in metadata
- Filter client-side from `useAllEvents`
- Add filter chips UI

---

## 📁 Files Created ✅

| File                                   | Purpose                      | Status                           |
| -------------------------------------- | ---------------------------- | -------------------------------- |
| `src/hooks/use-creator-events.ts`      | Fetch events by creator      | ✅ Created                       |
| `src/hooks/use-check-in.ts`            | Check-in ticket logic        | ✅ Created                       |
| `src/app/my-events/page.tsx`           | Creator dashboard page       | ✅ Created                       |
| `src/app/check-in/[eventId]/page.tsx`  | QR scanner + manual check-in | ✅ Created                       |
| `src/components/scanner/QRScanner.tsx` | QR code scanner              | ⚠️ Integrated into check-in page |

---

## 🔗 Contract IDs Reference

| Contract     | Network | Contract ID                                                |
| ------------ | ------- | ---------------------------------------------------------- |
| Factory      | Testnet | `CA2HZDTERE5QPWW3G3YZWB2XTNPGCW2HTEJEWDKCCAHZ7Q4NEO5FWL4V` |
| NFT Template | Testnet | `CBBF6CHQTD2KPFI5VQ5BT7LHPPWXGHEAGMTJ3OUZ74TVD6DCJMWN4F4V` |

---

## ✅ Action Items

- [x] Create `use-creator-events.ts` hook ✅
- [x] Create `/my-events` page ✅
- [x] Create `use-check-in.ts` hook ✅
- [x] Create `/check-in/[eventId]` page ✅
- [x] Add QR Scanner component ✅ (integrated in check-in page)
- [x] Integrate `get_event_count` in stats ✅
- [x] Add category filtering to discover page ✅ (already implemented)
- [x] Add "My Events" link to Header navigation ✅
- [ ] Create activity feed indexer (optional)

---

_This analysis should be updated as features are implemented._
