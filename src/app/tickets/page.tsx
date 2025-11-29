"use client";

import { MainLayout } from "@/components/layouts";
import { ArrowUpRight, QrCode } from "lucide-react";
import Link from "next/link";
import { useFreighter } from "@/providers/FreighterProvider";
import { FreighterConnect } from "@/components/FreighterConnect";

import {
  TicketCard,
  ViewTicketModal,
  SendTicketModal,
  SellTicketModal,
  type Ticket,
} from "@/components/tickets";
import { useTicketActions } from "@/hooks/use-ticket-actions";

// Mock data - replace with actual API/blockchain data
const MOCK_TICKETS: Ticket[] = [
  {
    id: "1",
    tokenId: "#1234",
    contractAddress: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    eventName: "Stellar Denver 2024",
    eventDate: "2024-03-15",
    eventTime: "10:00 AM MST",
    location: "Colorado Convention Center, Denver, CO",
    category: "Conference",
    image: "/lock.png",
    ownerAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3T3ECJDQ2Q7M",
    originalPrice: 0.5,
    currency: "XLM",
    status: "ACTIVE",
    isListed: false,
    purchasedAt: "2024-01-15T10:30:00Z",
    creatorAddress: "GBZX4PWDFNHF7P2BM5M7XVSWSW5CWVK2YBXYZDXMG3KQPBMZX7SVGW2Y",
    royaltyBps: 500,
  },
  {
    id: "2",
    tokenId: "#5678",
    contractAddress: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    eventName: "Web3 Music Festival",
    eventDate: "2024-04-22",
    eventTime: "6:00 PM EST",
    location: "Brooklyn Steel, New York, NY",
    category: "Music",
    image: "/hands.png",
    ownerAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3T3ECJDQ2Q7M",
    originalPrice: 0.3,
    currency: "XLM",
    status: "ACTIVE",
    isListed: false,
    purchasedAt: "2024-02-01T14:20:00Z",
    creatorAddress: "GBZX4PWDFNHF7P2BM5M7XVSWSW5CWVK2YBXYZDXMG3KQPBMZX7SVGW2Y",
    royaltyBps: 500,
  },
  {
    id: "3",
    tokenId: "#9012",
    contractAddress: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    eventName: "NFT.NYC Conference",
    eventDate: "2024-05-08",
    eventTime: "9:00 AM EST",
    location: "Javits Center, New York, NY",
    category: "Conference",
    image: "/computer.png",
    ownerAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3T3ECJDQ2Q7M",
    originalPrice: 0.8,
    currentPrice: 1.2,
    currency: "XLM",
    status: "LISTED",
    isListed: true,
    listingId: "listing-001",
    purchasedAt: "2024-02-10T09:15:00Z",
    creatorAddress: "GBZX4PWDFNHF7P2BM5M7XVSWSW5CWVK2YBXYZDXMG3KQPBMZX7SVGW2Y",
    royaltyBps: 500,
  },
  {
    id: "4",
    tokenId: "#3456",
    contractAddress: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    eventName: "Crypto Summit 2024",
    eventDate: "2024-02-10",
    eventTime: "11:00 AM PST",
    location: "Moscone Center, San Francisco, CA",
    category: "Conference",
    image: "/watchtower.png",
    ownerAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3T3ECJDQ2Q7M",
    originalPrice: 0.6,
    currency: "XLM",
    status: "USED",
    isListed: false,
    purchasedAt: "2024-01-05T16:45:00Z",
    usedAt: "2024-02-10T10:30:00Z",
    creatorAddress: "GBZX4PWDFNHF7P2BM5M7XVSWSW5CWVK2YBXYZDXMG3KQPBMZX7SVGW2Y",
    royaltyBps: 500,
  },
];

export default function MyTicketsPage() {
  const { isConnected, publicKey, network } = useFreighter();

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
    downloadTicket,
  } = useTicketActions();

  // Filter tickets by status
  const activeTickets = MOCK_TICKETS.filter(
    (t) => t.status === "ACTIVE" || t.status === "LISTED"
  );
  const pastTickets = MOCK_TICKETS.filter(
    (t) => t.status === "USED" || t.status === "EXPIRED"
  );

  // Calculate stats
  const stats = [
    { label: "Total Tickets", value: MOCK_TICKETS.length.toString() },
    { label: "Active", value: activeTickets.length.toString() },
    {
      label: "Total Value",
      value: `${MOCK_TICKETS.reduce(
        (acc, t) => acc + t.originalPrice,
        0
      ).toFixed(1)} XLM`,
    },
  ];

  // Action handlers
  const handleView = (params: { ticketId: string }) => {
    const ticket = MOCK_TICKETS.find((t) => t.id === params.ticketId);
    if (ticket) openViewModal(ticket);
  };

  const handleSend = (params: { ticketId: string }) => {
    const ticket = MOCK_TICKETS.find((t) => t.id === params.ticketId);
    if (ticket) openSendModal(ticket);
  };

  const handleSell = (params: { ticketId: string }) => {
    const ticket = MOCK_TICKETS.find((t) => t.id === params.ticketId);
    if (ticket) openSellModal(ticket);
  };

  const handleDownload = (ticketId: string) => {
    const ticket = MOCK_TICKETS.find((t) => t.id === ticketId);
    if (ticket) downloadTicket(ticket);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto md:px-0">
        {/* Header Section */}
        <div className="border border-t-0 corner-accents">
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
            <div className="md:col-span-2 p-8 md:p-12 space-y-4 border-b md:border-b-0">
              <div className="inline-block border corner-accents bg-accent/5 text-accent px-3 py-1 text-xs font-bold">
                [YOUR_WALLET]
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                My Tickets
              </h1>
              <p className="text-muted-foreground text-sm">
                &gt; NFT_COLLECTION // READY_TO_USE_OR_TRADE
              </p>
            </div>
            {/* Wallet Info */}
            <div className="flex flex-col divide-y">
              <div className="p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-xs text-muted-foreground mb-1">
                  WALLET_ADDRESS
                </div>
                {isConnected && publicKey ? (
                  <div className="text-sm font-bold font-mono text-green-500">
                    {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
                  </div>
                ) : (
                  <div className="text-sm font-bold font-mono text-muted-foreground">
                    Not Connected
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-xs text-muted-foreground mb-1">
                  CHAIN_NETWORK
                </div>
                {network ? (
                  <div className="text-sm font-bold text-green-500">
                    {network}
                  </div>
                ) : (
                  <div className="text-sm font-bold text-muted-foreground">
                    Not Connected
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                <FreighterConnect />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border border-t-0 corner-accents grid grid-cols-3 divide-x">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-6 hover:bg-muted/30 transition-colors"
            >
              <div className="text-xs text-muted-foreground font-bold">
                [{stat.label.toUpperCase().replace(/ /g, "_")}]
              </div>
              <div className="text-2xl font-bold text-accent mt-2">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Active Tickets */}
        {activeTickets.length > 0 && (
          <div className="border border-t-0 corner-accents">
            <div className="p-6 md:p-8 border-b">
              <h2 className="text-2xl font-bold tracking-tight">
                [ACTIVE_TICKETS]
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y">
              {activeTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  variant={ticket.isListed ? "listed" : "active"}
                  onView={handleView}
                  onSend={handleSend}
                  onSell={handleSell}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Tickets */}
        {pastTickets.length > 0 && (
          <div className="border border-t-0 corner-accents">
            <div className="p-6 md:p-8 border-b">
              <h2 className="text-2xl font-bold tracking-tight">
                [PAST_EVENTS]
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-y md:divide-y-0">
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
        {MOCK_TICKETS.length === 0 && (
          <div className="border border-t-0 corner-accents p-12 md:p-24">
            <div className="max-w-md mx-auto">
              <div className="border corner-accents p-8 bg-muted/5 space-y-6">
                <div className="border corner-accents w-16 h-16 bg-accent/10 flex items-center justify-center mx-auto">
                  <QrCode className="w-8 h-8 text-accent" />
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-bold">[NO_TICKETS_FOUND]</h2>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>&gt; COLLECTION_EMPTY</p>
                    <p>&gt; START_COLLECTING_NFT_TICKETS</p>
                  </div>
                </div>
                <Link href="/discover" className="block">
                  <div className="border corner-accents flex hover:bg-accent hover:text-white cursor-pointer transition-colors items-center justify-center gap-2 px-4 py-3 bg-accent/5">
                    <span className="text-sm font-bold">[DISCOVER_EVENTS]</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
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
