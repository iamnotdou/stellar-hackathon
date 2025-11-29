// ============================================================================
// TICKET TYPES
// ============================================================================

/**
 * Ticket status enum
 */
export type TicketStatus =
  | "ACTIVE"
  | "USED"
  | "EXPIRED"
  | "TRANSFERRED"
  | "LISTED";

/**
 * Ticket category enum
 */
export type TicketCategory =
  | "Music"
  | "Conference"
  | "Sports"
  | "Art"
  | "Theater"
  | "Festival"
  | "Other";

/**
 * Transfer record for ticket history
 */
export interface TransferRecord {
  from: string;
  to: string;
  timestamp: string;
  txHash: string;
  price?: number;
  type: "purchase" | "transfer" | "gift";
}

/**
 * Main Ticket interface
 */
export interface Ticket {
  id: string;
  tokenId: string;
  contractAddress: string;

  // Event info
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  category: TicketCategory;
  image: string;

  // Ownership
  ownerAddress: string;
  originalPrice: number;
  currentPrice?: number;
  currency: "XLM" | "USDC" | "ETH";

  // Status
  status: TicketStatus;
  isListed: boolean;
  listingId?: string;

  // Metadata
  purchasedAt: string;
  usedAt?: string;
  expiresAt?: string;
  transferHistory?: TransferRecord[];

  // Creator info (for royalties)
  creatorAddress?: string;
  royaltyBps?: number;
}

// ============================================================================
// ACTION PARAMS
// ============================================================================

/**
 * Parameters for viewing a ticket
 */
export interface ViewTicketParams {
  ticketId: string;
  tokenId: string;
  contractAddress: string;
}

/**
 * Parameters for sending/transferring a ticket
 */
export interface SendTicketParams {
  ticketId: string;
  tokenId: string;
  contractAddress: string;
  fromAddress: string;
  toAddress: string;
}

/**
 * Parameters for listing a ticket for sale
 */
export interface SellTicketParams {
  ticketId: string;
  tokenId: string;
  contractAddress: string;
  ownerAddress: string;
  askingPrice: number;
  currency: "XLM" | "USDC";
  expiresAt?: string;
}

/**
 * Parameters for canceling a listing
 */
export interface CancelListingParams {
  ticketId: string;
  listingId: string;
  ownerAddress: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * TicketCard variants
 */
export type TicketCardVariant = "active" | "past" | "compact" | "listed";

/**
 * TicketCard component props
 */
export interface TicketCardProps {
  ticket: Ticket;
  variant?: TicketCardVariant;
  onView?: (params: ViewTicketParams) => void;
  onSend?: (params: SendTicketParams) => void;
  onSell?: (params: SellTicketParams) => void;
  onCancelListing?: (params: CancelListingParams) => void;
  onDownload?: (ticketId: string) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * TicketActions component props
 */
export interface TicketActionsProps {
  ticket: Ticket;
  variant?: TicketCardVariant;
  onView: () => void;
  onSend: () => void;
  onSell: () => void;
  onCancelListing?: () => void;
  onDownload?: () => void;
  disabled?: boolean;
}

/**
 * TicketImage component props
 */
export interface TicketImageProps {
  src: string;
  alt: string;
  status: TicketStatus;
  category: TicketCategory;
  tokenId?: string;
  variant?: TicketCardVariant;
  className?: string;
}

/**
 * TicketInfo component props
 */
export interface TicketInfoProps {
  ticket: Ticket;
  variant?: TicketCardVariant;
  showPrice?: boolean;
  className?: string;
}

// ============================================================================
// MODAL PROPS
// ============================================================================

/**
 * Base modal props
 */
export interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * ViewTicketModal props
 */
export interface ViewTicketModalProps extends BaseModalProps {
  ticket: Ticket | null;
  onDownload?: () => void;
}

/**
 * SendTicketModal props
 */
export interface SendTicketModalProps extends BaseModalProps {
  ticket: Ticket | null;
  senderAddress: string;
  onSend: (toAddress: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * SellTicketModal props
 */
export interface SellTicketModalProps extends BaseModalProps {
  ticket: Ticket | null;
  ownerAddress: string;
  onSell: (price: number, currency: "XLM" | "USDC") => Promise<void>;
  isLoading?: boolean;
  platformFeeBps?: number;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

/**
 * useTicketActions hook return type
 */
export interface UseTicketActionsReturn {
  // State
  selectedTicket: Ticket | null;
  activeModal: "view" | "send" | "sell" | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  openViewModal: (ticket: Ticket) => void;
  openSendModal: (ticket: Ticket) => void;
  openSellModal: (ticket: Ticket) => void;
  closeModal: () => void;

  // Transactions
  sendTicket: (toAddress: string) => Promise<void>;
  listTicket: (price: number, currency: "XLM" | "USDC") => Promise<void>;
  cancelListing: () => Promise<void>;

  // Utilities
  generateQRCode: (ticket: Ticket) => string;
  downloadTicket: (ticket: Ticket) => void;
}
