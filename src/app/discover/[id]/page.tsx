"use client";

import { MainLayout } from "@/components/layouts";
import {
  SecondaryMarket,
  type SecondaryListing,
} from "@/components/marketplace";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { useEventDetails } from "@/hooks/use-event-details";
import { useFreighter } from "@/providers/FreighterProvider";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Heart,
  Loader2,
  Share2,
  ShieldCheck,
  Ticket,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Client } from "../../../../sticket-contracts/packages/sticket-nft-collections/src/index";

// Network constants
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

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

function formatDate(dateString?: string): string {
  if (!dateString) return "TBA";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "TBA";
  }
}

function formatTime(dateString?: string): string {
  if (!dateString) return "TBA";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "TBA";
  }
}

export default function EventDetailPage() {
  const params = useParams();
  const contractId = params.id as string;

  const {
    data: event,
    isLoading,
    error,
    refetch,
  } = useEventDetails(contractId);
  const { isConnected, publicKey, connect, signTransaction } = useFreighter();

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  // Create NFT client with signing capability
  const createSigningClient = () => {
    if (!publicKey) throw new Error("Wallet not connected");

    return new Client({
      contractId: contractId,
      networkPassphrase: NETWORK_PASSPHRASE,
      rpcUrl: SOROBAN_RPC_URL,
      publicKey: publicKey,
      signTransaction: async (xdr: string) => {
        const result = await signTransaction(xdr, {
          networkPassphrase: NETWORK_PASSPHRASE,
        });
        return result;
      },
    });
  };

  // Convert contract secondary listings to UI format
  const secondaryListings: SecondaryListing[] = (
    event?.secondary_listings || []
  ).map((listing, index) => ({
    id: `listing-${listing.ticket_id}`,
    tokenId: `#${listing.ticket_id.toString().padStart(4, "0")}`,
    sellerAddress: `${listing.seller.slice(0, 6)}...${listing.seller.slice(
      -4
    )}`,
    askingPrice: listing.price,
    originalPrice: event?.primary_price || 0,
    currency: "XLM",
    listedAt: new Date().toISOString(),
    transferCount: index,
  }));

  const handleBuyFromSecondary = async (listing: SecondaryListing) => {
    if (!isConnected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const client = createSigningClient();
      const ticketId = parseInt(listing.tokenId.replace("#", ""));

      const tx = await client.buy_secondary_ticket({
        buyer: publicKey,
        ticket_id: ticketId,
      });

      await tx.signAndSend();
      toast.success("Ticket purchased successfully!");
      refetch();
    } catch (err) {
      console.error("Secondary purchase error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to purchase ticket"
      );
    }
  };

  const handleBuyPrimary = async () => {
    if (!isConnected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsPurchasing(true);

    try {
      const client = createSigningClient();

      const tx = await client.mint_ticket({
        buyer: publicKey,
      });

      const result = await tx.signAndSend();

      console.log("Ticket minted! Ticket ID:", result.result);
      toast.success(`Ticket purchased! ID: #${result.result}`);

      setIsBuyModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Purchase error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to purchase ticket"
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleConnectAndBuy = async () => {
    try {
      await connect();
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  const handleCopyContract = () => {
    navigator.clipboard.writeText(event?.contractId || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const eventImage = event?.metadata?.image
    ? convertIpfsUrl(event.metadata.image)
    : getPlaceholderImage(contractId);

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] border-x border-t-0 corner-accents  max-w-5xl mx-auto flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Loading event...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] border flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Event Not Found</h1>
              <p className="text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "This event doesn't exist or has been removed."}
              </p>
            </div>
            <Link href="/discover">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const ticketStatus =
    event.tickets_available === 0
      ? "SOLD OUT"
      : event.tickets_available < event.total_supply * 0.2
      ? "LOW STOCK"
      : "ON SALE";

  const availabilityPercent =
    (event.tickets_available / event.total_supply) * 100;

  return (
    <MainLayout>
      <div className="max-w-5xl border-x mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Event Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Event Image */}
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-border">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${eventImage})` }}
              />

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <div
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    ticketStatus === "SOLD OUT"
                      ? "bg-destructive text-white"
                      : ticketStatus === "LOW STOCK"
                      ? "bg-yellow-500 text-black"
                      : "bg-accent text-white"
                  }`}
                >
                  {ticketStatus}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`p-2 rounded border ${
                    liked
                      ? "bg-accent text-white border-accent"
                      : "bg-background/80 text-foreground border-border hover:bg-muted"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                </button>
                <button className="p-2 rounded bg-background/80 text-foreground border border-border hover:bg-muted">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Event Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{event.name}</h1>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 border divide-x gap-3">
              <div className="flex items-center gap-3 p-2 ">
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium">
                    {formatDate(event.metadata?.dateTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 ">
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium">
                    {formatTime(event.metadata?.dateTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 ">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium truncate">
                    {event.metadata?.locationAddress || "TBA"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold">About This Event</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {event.metadata?.description || "No description available."}
              </p>
            </div>

            {/* Organizer */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Organized By</h2>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between w-full gap-3">
                  <p className="text-sm text-muted-foreground">Event Creator</p>
                  <button
                    onClick={handleCopyContract}
                    className="flex items-center gap-2 text-sm font-mono hover:text-accent"
                  >
                    {event.event_creator.slice(0, 8)}...
                    {event.event_creator.slice(-6)}
                  </button>
                </div>
              </div>
            </div>

            {/* Contract Info */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Contract Details</h2>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    Contract Address
                  </span>
                  <button
                    onClick={handleCopyContract}
                    className="flex items-center gap-2 text-sm font-mono hover:text-accent"
                  >
                    {event.contractId.slice(0, 8)}...
                    {event.contractId.slice(-6)}
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    Creator Fee
                  </span>
                  <span className="text-sm font-medium">
                    {event.creator_fee_percent}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    Payment Token
                  </span>
                  <span className="text-sm font-medium">XLM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Price Card */}
              <div className="rounded-lg border border-border overflow-hidden">
                {/* Price Header */}
                <div className="p-5 border-b border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">
                    Ticket Price
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {event.primary_price}
                    </span>
                    <span className="text-muted-foreground">XLM</span>
                  </div>
                </div>

                {/* Availability */}
                <div className="p-5 border-b border-border space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium">
                      {event.tickets_available}{" "}
                      <span className="text-muted-foreground">
                        / {event.total_supply}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-accent rounded"
                      style={{ width: `${availabilityPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {event.total_supply - event.tickets_available} tickets sold
                  </p>
                </div>

                {/* Buy Button */}
                <div className="p-5">
                  <button
                    onClick={() => setIsBuyModalOpen(true)}
                    disabled={event.tickets_available === 0}
                    className="w-full py-3 rounded-lg bg-accent hover:bg-accent/90 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {event.tickets_available === 0 ? (
                      "Sold Out"
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        Get Tickets
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Event</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4" />
                  <span>NFT Tickets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Market */}
      {secondaryListings.length > 0 && (
        <div className="max-w-5xl mx-auto pb-12">
          <SecondaryMarket
            listings={secondaryListings}
            originalPrice={event.primary_price}
            eventInfo={{ name: event.name, image: eventImage }}
            onBuy={handleBuyFromSecondary}
          />
        </div>
      )}

      {/* Buy Primary Ticket Modal */}
      <ResponsiveModal
        open={isBuyModalOpen}
        onOpenChange={(o) => !isPurchasing && setIsBuyModalOpen(o)}
        title="Complete Your Purchase"
        description={`Get a ticket for ${event.name}`}
        icon={
          <div
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border"
          >
            <Ticket className="size-5 text-muted-foreground" />
          </div>
        }
      >
        <ResponsiveModalContent>
          {/* Event Preview */}
          <div className="flex items-center gap-3 border-t pt-5 ">
            <div
              className="aspect-video h-14 rounded-lg border border-border bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: `url(${eventImage})` }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{event.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(event.metadata?.dateTime)}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {event.metadata?.locationAddress || "Location TBA"}
              </p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Order Summary
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket Price</span>
                <span className="font-mono">
                  {event.primary_price.toFixed(2)} XLM
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-mono text-muted-foreground">
                  ~0.01 XLM
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium">Total</span>
                <span className="font-mono font-semibold">
                  {(event.primary_price + 0.01).toFixed(2)} XLM
                </span>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secured by Stellar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              <span>Resellable NFT</span>
            </div>
          </div>

          <ResponsiveModalFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsBuyModalOpen(false)}
              disabled={isPurchasing}
              className="flex-1"
            >
              Cancel
            </Button>
            {isConnected ? (
              <Button
                onClick={handleBuyPrimary}
                disabled={isPurchasing}
                className="flex-1"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay {event.primary_price.toFixed(2)} XLM</>
                )}
              </Button>
            ) : (
              <Button onClick={handleConnectAndBuy} className="flex-1">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </MainLayout>
  );
}
