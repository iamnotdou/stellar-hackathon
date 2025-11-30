import { useQuery } from "@tanstack/react-query";
import {
  Client as FactoryClient,
  networks,
} from "../../packages/sticket-factory/src/index";
import type { EventRecord } from "../../packages/sticket-factory/src/index";
import {
  Client as NftClient,
  EventInfo,
  TicketData,
} from "../../packages/sticket-nft-collections/src/index";

const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;
const STROOPS_TO_XLM = 10_000_000;

function createFactoryClient(): FactoryClient {
  return new FactoryClient({
    contractId: networks.testnet.contractId,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
  });
}

function createNftClient(contractId: string): NftClient {
  return new NftClient({
    contractId,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
  });
}

// User ticket with full event info
export interface UserTicket {
  // Ticket info
  ticket_id: number;
  token_id: string; // Formatted like #0001
  owner: string;
  is_used: boolean;

  // Event info
  event_contract: string;
  event_name: string;
  event_symbol: string;
  event_creator: string;
  event_metadata: string;

  // Pricing
  original_price: number; // In XLM
  original_price_stroops: bigint;

  // Status
  status: "ACTIVE" | "USED" | "LISTED";
  is_listed: boolean;
  listing_price?: number;

  // Metadata (from IPFS if available)
  metadata?: EventMetadata | null;
}

export interface EventMetadata {
  description?: string;
  dateTime?: string;
  locationAddress?: string;
  category?: string;
  image?: string;
  contact?: string;
}

async function fetchMetadata(
  metadataUrl: string
): Promise<EventMetadata | null> {
  if (!metadataUrl) return null;

  try {
    let fetchUrl = metadataUrl;
    if (metadataUrl.startsWith("ipfs://")) {
      const cid = metadataUrl.replace("ipfs://", "");
      fetchUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}

async function fetchUserTicketsFromEvent(
  eventContract: string,
  userAddress: string
): Promise<UserTicket[]> {
  try {
    const nftClient = createNftClient(eventContract);

    // Get user's ticket IDs for this event
    const userTicketsTx = await nftClient.get_user_tickets({
      user: userAddress,
    });
    const userTicketsResult = await userTicketsTx.simulate();
    const ticketIds = (userTicketsResult.result as number[]) || [];

    if (ticketIds.length === 0) return [];

    // Get event info
    const eventInfoTx = await nftClient.get_event_info();
    const eventInfoResult = await eventInfoTx.simulate();
    const eventInfo = eventInfoResult.result as EventInfo;

    // Fetch metadata
    const metadata = await fetchMetadata(eventInfo.event_metadata);

    // Get all secondary listings to check if tickets are listed
    const listingsTx = await nftClient.get_all_secondary_listings();
    const listingsResult = await listingsTx.simulate();
    const listings =
      (listingsResult.result as { ticket_id: number; price: bigint }[]) || [];
    const listedTicketIds = new Set(listings.map((l) => l.ticket_id));
    const listingPrices = new Map(
      listings.map((l) => [l.ticket_id, Number(l.price) / STROOPS_TO_XLM])
    );

    // Get ticket data for each ticket
    const ticketResults = await Promise.all(
      ticketIds.map(async (ticketId): Promise<UserTicket | null> => {
        try {
          const ticketTx = await nftClient.get_ticket({ ticket_id: ticketId });
          const ticketResult = await ticketTx.simulate();
          const ticketData = ticketResult.result as TicketData;

          const isListed = listedTicketIds.has(ticketId);
          const listingPrice = listingPrices.get(ticketId);

          return {
            ticket_id: ticketId,
            token_id: `#${ticketId.toString().padStart(4, "0")}`,
            owner: ticketData.owner,
            is_used: ticketData.is_used,
            event_contract: eventContract,
            event_name: eventInfo.name,
            event_symbol: eventInfo.symbol,
            event_creator: eventInfo.event_creator,
            event_metadata: eventInfo.event_metadata,
            original_price: Number(eventInfo.primary_price) / STROOPS_TO_XLM,
            original_price_stroops: eventInfo.primary_price,
            status: ticketData.is_used
              ? "USED"
              : isListed
              ? "LISTED"
              : "ACTIVE",
            is_listed: isListed,
            listing_price: listingPrice,
            metadata,
          };
        } catch (error) {
          console.error(`Failed to fetch ticket ${ticketId}:`, error);
          return null;
        }
      })
    );

    return ticketResults.filter((t): t is UserTicket => t !== null);
  } catch (error) {
    console.error(`Failed to fetch tickets from ${eventContract}:`, error);
    return [];
  }
}

async function fetchAllUserTickets(userAddress: string): Promise<UserTicket[]> {
  if (!userAddress) return [];

  // Get all events from factory
  const factoryClient = createFactoryClient();
  const eventsTx = await factoryClient.get_all_events();
  const eventsResult = await eventsTx.simulate();
  const events = (eventsResult.result as EventRecord[]) || [];

  // Fetch tickets from all events in parallel
  const ticketsPerEvent = await Promise.all(
    events.map((event) =>
      fetchUserTicketsFromEvent(event.event_contract, userAddress)
    )
  );

  // Flatten and return
  return ticketsPerEvent.flat();
}

export function useUserTickets(userAddress: string | null | undefined) {
  return useQuery({
    queryKey: ["user-tickets", userAddress],
    queryFn: () => fetchAllUserTickets(userAddress!),
    enabled: !!userAddress,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export { STROOPS_TO_XLM };
