// ============================================================================
// MARKETPLACE TYPES
// ============================================================================

export interface SecondaryListing {
  id: string;
  tokenId: string;
  sellerAddress: string;
  askingPrice: number;
  originalPrice: number;
  currency: "XLM" | "USDC";
  listedAt: string;
  sellerRating?: number;
  transferCount: number;
}

export interface MarketStats {
  floorPrice: number;
  avgPrice: number;
  listingsCount: number;
  originalPrice: number;
}

export interface EventInfo {
  name: string;
  image: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface SecondaryMarketProps {
  listings: SecondaryListing[];
  originalPrice: number;
  eventInfo: EventInfo;
  onBuy?: (listing: SecondaryListing) => Promise<void>;
}

export interface BuyTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: SecondaryListing | null;
  eventInfo: EventInfo;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export interface ListingRowProps {
  listing: SecondaryListing;
  onBuy: (listing: SecondaryListing) => void;
}

// ============================================================================
// UTILITIES
// ============================================================================

export function getPriceDiff(asking: number, original: number): number {
  return ((asking - original) / original) * 100;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function calculateMarketStats(
  listings: SecondaryListing[],
  originalPrice: number
): MarketStats {
  if (listings.length === 0) {
    return {
      floorPrice: 0,
      avgPrice: 0,
      listingsCount: 0,
      originalPrice,
    };
  }

  const prices = listings.map((l) => l.askingPrice);
  return {
    floorPrice: Math.min(...prices),
    avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    listingsCount: listings.length,
    originalPrice,
  };
}
