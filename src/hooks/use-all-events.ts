import { useQuery } from "@tanstack/react-query";
import {
  Client as FactoryClient,
  networks,
  EventRecord,
} from "../../sticket-contracts/packages/sticket-factory/src/index";
import {
  Client as NftClient,
  EventInfo,
} from "../../sticket-contracts/packages/sticket-nft-collections/src/index";

const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;

// Convert stroops to XLM (1 XLM = 10,000,000 stroops)
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

// Metadata structure (from IPFS)
export interface EventMetadata {
  description?: string;
  dateTime?: string;
  locationAddress?: string;
  category?: string;
  image?: string;
  contact?: string;
  secondaryMarketFee?: number;
}

// Full event data including price and availability
export interface FullEventData {
  // From factory
  id: number;
  name: string;
  symbol: string;
  event_contract: string;
  event_creator: string;
  created_at: number;
  // From NFT contract
  total_supply: number;
  tickets_available: number;
  tickets_minted: number;
  primary_price: number; // In XLM
  primary_price_stroops: bigint;
  creator_fee_bps: number;
  event_metadata: string;
  payment_token: string;
  // Parsed metadata
  metadata?: EventMetadata | null;
}

async function fetchMetadata(
  metadataUrl: string
): Promise<EventMetadata | null> {
  if (!metadataUrl) return null;

  try {
    // Handle IPFS URLs
    let fetchUrl = metadataUrl;
    if (metadataUrl.startsWith("ipfs://")) {
      const cid = metadataUrl.replace("ipfs://", "");
      fetchUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch metadata:", error);
    return null;
  }
}

async function fetchEventDetails(eventContract: string): Promise<{
  eventInfo: EventInfo | null;
  ticketsAvailable: number;
  ticketsMinted: number;
  metadata: EventMetadata | null;
}> {
  try {
    const nftClient = createNftClient(eventContract);

    // Fetch event info and ticket counts in parallel
    const [eventInfoTx, availableTx, mintedTx] = await Promise.all([
      nftClient.get_event_info(),
      nftClient.get_tickets_available(),
      nftClient.get_tickets_minted(),
    ]);

    const [eventInfoResult, availableResult, mintedResult] = await Promise.all([
      eventInfoTx.simulate(),
      availableTx.simulate(),
      mintedTx.simulate(),
    ]);

    const eventInfo = (eventInfoResult.result as EventInfo) || null;

    // Fetch metadata from IPFS
    const metadata = eventInfo?.event_metadata
      ? await fetchMetadata(eventInfo.event_metadata)
      : null;

    return {
      eventInfo,
      ticketsAvailable: (availableResult.result as number) || 0,
      ticketsMinted: (mintedResult.result as number) || 0,
      metadata,
    };
  } catch (error) {
    console.error(`Failed to fetch details for ${eventContract}:`, error);
    return {
      eventInfo: null,
      ticketsAvailable: 0,
      ticketsMinted: 0,
      metadata: null,
    };
  }
}

async function fetchAllEvents(): Promise<FullEventData[]> {
  const factoryClient = createFactoryClient();
  const tx = await factoryClient.get_all_events();
  const result = await tx.simulate();

  if (result.result === undefined) {
    throw new Error("Failed to fetch events from factory");
  }

  const events = result.result as EventRecord[];

  // Fetch details for each event in parallel
  const eventsWithDetails = await Promise.all(
    events.map(async (event, index) => {
      const details = await fetchEventDetails(event.event_contract);

      return {
        // From factory
        id: index,
        name: event.name,
        symbol: event.symbol,
        event_contract: event.event_contract,
        event_creator: event.event_creator,
        created_at: Number(event.created_at),
        // From NFT contract
        total_supply: details.eventInfo?.total_supply || 0,
        tickets_available: details.ticketsAvailable,
        tickets_minted: details.ticketsMinted,
        primary_price: details.eventInfo
          ? Number(details.eventInfo.primary_price) / STROOPS_TO_XLM
          : 0,
        primary_price_stroops: details.eventInfo?.primary_price || BigInt(0),
        creator_fee_bps: details.eventInfo?.creator_fee_bps || 0,
        event_metadata: details.eventInfo?.event_metadata || "",
        payment_token: details.eventInfo?.payment_token || "",
        // Parsed metadata
        metadata: details.metadata,
      };
    })
  );

  return eventsWithDetails;
}

export function useAllEvents() {
  return useQuery({
    queryKey: ["sticket-factory", "all-events"],
    queryFn: fetchAllEvents,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Export helpers
export { createFactoryClient, createNftClient, STROOPS_TO_XLM };
