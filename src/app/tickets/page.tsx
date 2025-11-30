"use client";

import { useMemo } from "react";
import { MainLayout } from "@/components/layouts";
import { ArrowUpRight, QrCode, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFreighter } from "@/providers/FreighterProvider";
import { FreighterConnect } from "@/components/FreighterConnect";
import { useUserTickets, type UserTicket } from "@/hooks/use-user-tickets";

import {
  TicketCard,
  ViewTicketModal,
  SendTicketModal,
  SellTicketModal,
  type Ticket,
  type TicketCategory,
} from "@/components/tickets";
import { useTicketActions } from "@/hooks/use-ticket-actions";

// Placeholder images
const PLACEHOLDER_IMAGES = [
  "/lock.png",
  "/hands.png",
  "/computer.png",
  "/watchtower.png",
];

function getPlaceholderImage(contractId: string): string {
  const hash = contractId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length];
}

// Convert IPFS URL to gateway URL
function convertIpfsUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("ipfs://")) {
    const cid = url.replace("ipfs://", "");
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  return url;
}

// Convert UserTicket to Ticket interface for components
function mapToTicket(userTicket: UserTicket): Ticket {
  const eventDate = userTicket.metadata?.dateTime
    ? new Date(userTicket.metadata.dateTime).toLocaleDateString()
    : "TBA";
  const eventTime = userTicket.metadata?.dateTime
    ? new Date(userTicket.metadata.dateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBA";

  return {
    id: `${userTicket.event_contract}-${userTicket.ticket_id}`,
    tokenId: userTicket.token_id,
    contractAddress: userTicket.event_contract,
    eventName: userTicket.event_name,
    eventDate,
    eventTime,
    location: userTicket.metadata?.locationAddress || "TBA",
    category: (userTicket.metadata?.category as TicketCategory) || "Other",
    image: userTicket.metadata?.image
      ? convertIpfsUrl(userTicket.metadata.image)
      : getPlaceholderImage(userTicket.event_contract),
    ownerAddress: userTicket.owner,
    originalPrice: userTicket.original_price,
    currentPrice: userTicket.listing_price,
    currency: "XLM",
    status: userTicket.status,
    isListed: userTicket.is_listed,
    purchasedAt: new Date().toISOString(), // We don't have this from contract
    creatorAddress: userTicket.event_creator,
  };
}

export default function MyTicketsPage() {
  const { isConnected, publicKey } = useFreighter();
  const { data: userTickets, isLoading, error } = useUserTickets(publicKey);

  const {
    selectedTicket,
    activeModal,
    isProcessing,
    openViewModal,
    openSendModal,
    openSellModal,
    closeModal,
    sendTicket,
    listTicket,
    cancelListing,
    downloadTicket,
  } = useTicketActions();

  // Convert user tickets to Ticket interface
  const tickets = useMemo(
    () => (userTickets || []).map(mapToTicket),
    [userTickets]
  );

  // Filter tickets by status
  const activeTickets = useMemo(
    () => tickets.filter((t) => t.status === "ACTIVE" || t.status === "LISTED"),
    [tickets]
  );

  const pastTickets = useMemo(
    () => tickets.filter((t) => t.status === "USED" || t.status === "EXPIRED"),
    [tickets]
  );

  // Calculate stats
  const stats = useMemo(
    () => [
      { label: "Total Tickets", value: tickets.length.toString() },
      { label: "Active", value: activeTickets.length.toString() },
      {
        label: "Total Value",
        value: `${tickets
          .reduce((acc, t) => acc + t.originalPrice, 0)
          .toFixed(1)} XLM`,
      },
    ],
    [tickets, activeTickets]
  );

  // Action handlers
  const handleView = (params: { ticketId: string }) => {
    const ticket = tickets.find((t) => t.id === params.ticketId);
    if (ticket) openViewModal(ticket);
  };

  const handleSend = (params: { ticketId: string }) => {
    const ticket = tickets.find((t) => t.id === params.ticketId);
    if (ticket) openSendModal(ticket);
  };

  const handleSell = (params: { ticketId: string }) => {
    const ticket = tickets.find((t) => t.id === params.ticketId);
    if (ticket) openSellModal(ticket);
  };

  const handleDownload = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) downloadTicket(ticket);
  };

  const handleCancelListing = async (params: {
    ticketId: string;
    listingId: string;
    ownerAddress: string;
  }) => {
    const ticket = tickets.find((t) => t.id === params.ticketId);
    if (ticket) {
      openViewModal(ticket); // Open view modal to show processing state
      try {
        await cancelListing();
        closeModal();
        // Ticket will be refreshed by react-query
      } catch (err) {
        console.error("Cancel listing failed:", err);
      }
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto md:px-0">
        {/* Header Section */}
        <div className="border border-t-0 corner-accents">
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
            <div className="md:col-span-2 p-6 space-y-3 border-b md:border-b-0">
              <div className="flex items-center gap-3">
                {isConnected && publicKey && (
                  <div className="text-xs text-accent font-mono ">
                    {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
                My Tickets
              </h1>
              <p className="text-muted-foreground text-xs">
                &gt; NFT_COLLECTION // READY_TO_USE_OR_TRADE
              </p>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 md:grid-cols-1 divide-x md:divide-x-0 md:divide-y">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="text-[10px] text-muted-foreground font-bold">
                    [{stat.label.toUpperCase().replace(/ /g, "_")}]
                  </div>
                  <div className="text-xl font-bold text-accent mt-1">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Not Connected State */}
        {!isConnected && (
          <div className="border border-t-0 corner-accents p-8">
            <div className="max-w-sm mx-auto">
              <div className="border corner-accents p-6 bg-muted/5 space-y-4">
                <div className="border corner-accents w-12 h-12 bg-accent/10 flex items-center justify-center mx-auto">
                  <QrCode className="w-6 h-6 text-accent" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">[CONNECT_WALLET]</h2>
                  <p className="text-xs text-muted-foreground">
                    Connect Freighter to view your NFT tickets
                  </p>
                </div>
                <div className="flex justify-center">
                  <FreighterConnect />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isConnected && isLoading && (
          <div className="border border-t-0 corner-accents p-8 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Loading tickets...</p>
          </div>
        )}

        {/* Error State */}
        {isConnected && error && (
          <div className="border border-t-0 corner-accents p-6 text-center">
            <p className="text-destructive text-sm">Failed to load tickets</p>
            <p className="text-xs text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}
        {isConnected && !isLoading && !error && (
          <>
            {/* Stats */}

            {/* Active Tickets */}
            {activeTickets.length > 0 && (
              <div className="border border-t-0 corner-accents">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight">
                    [ACTIVE_TICKETS]
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {activeTickets.length} tickets
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-x divide-y">
                  {activeTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      variant={ticket.isListed ? "listed" : "active"}
                      onView={handleView}
                      onSend={handleSend}
                      onSell={handleSell}
                      onCancelListing={handleCancelListing}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Tickets */}
            {pastTickets.length > 0 && (
              <div className="border border-t-0 corner-accents">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight">
                    [PAST_EVENTS]
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {pastTickets.length} tickets
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-x divide-y">
                  {pastTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      variant="past"
                      onView={handleView}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {tickets.length === 0 && (
              <div className="border border-t-0 corner-accents p-8">
                <div className="max-w-sm mx-auto">
                  <div className="border corner-accents p-6 bg-muted/5 space-y-4">
                    <div className="border corner-accents w-12 h-12 bg-accent/10 flex items-center justify-center mx-auto">
                      <QrCode className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-center space-y-2">
                      <h2 className="text-xl font-bold">[NO_TICKETS]</h2>
                      <p className="text-xs text-muted-foreground">
                        Start collecting NFT tickets from events
                      </p>
                    </div>
                    <Link href="/discover" className="block">
                      <div className="border corner-accents flex hover:bg-accent hover:text-white cursor-pointer transition-colors items-center justify-center gap-2 px-3 py-2 bg-accent/5 text-sm font-bold">
                        [DISCOVER_EVENTS]
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Connected Content */}
      </div>

      {/* Modals */}
      <ViewTicketModal
        open={activeModal === "view"}
        onOpenChange={(open) => !open && closeModal()}
        ticket={selectedTicket}
        onDownload={() => selectedTicket && downloadTicket(selectedTicket)}
      />

      <SendTicketModal
        open={activeModal === "send"}
        onOpenChange={(open) => !open && closeModal()}
        ticket={selectedTicket}
        senderAddress={publicKey || ""}
        onSend={sendTicket}
        isLoading={isProcessing}
      />

      <SellTicketModal
        open={activeModal === "sell"}
        onOpenChange={(open) => !open && closeModal()}
        ticket={selectedTicket}
        ownerAddress={publicKey || ""}
        onSell={listTicket}
        isLoading={isProcessing}
        platformFeeBps={250}
      />
    </MainLayout>
  );
}
