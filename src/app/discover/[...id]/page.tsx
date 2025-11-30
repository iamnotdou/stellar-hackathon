"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layouts";
import {
  ArrowUpRight,
  Users,
  Share2,
  Heart,
  Ticket,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import {
  SecondaryMarket,
  type SecondaryListing,
} from "@/components/marketplace";

// ============================================================================
// MOCK DATA
// ============================================================================

const EVENT = {
  name: "Stellar Denver 2024",
  date: "MAR 15, 2024",
  time: "10:00 AM - 6:00 PM MST",
  location: "Colorado Convention Center, Denver, CO",
  price: 0.5,
  currency: "XLM",
  available: 234,
  total: 500,
  status: "SELLING FAST",
  image: "/lock.png",
  category: "Conference",
  description:
    "Join the largest Stellar community gathering in North America. Experience three days of workshops, keynotes, and networking with the brightest minds in blockchain technology. This year's conference features exclusive panels on DeFi, NFTs, DAOs, and the future of Web3.",
  organizer: {
    name: "ETH Denver Team",
    verified: true,
    address: "0x8c4d...1a3f",
  },
  perks: [
    "Access to all keynote sessions",
    "Exclusive networking events",
    "Workshop materials & swag bag",
    "After-party access",
  ],
};

const SIMILAR_EVENTS = [
  {
    name: "Web3 Music Festival",
    date: "APR 22, 2024",
    price: "0.3 XLM",
    image: "/hands.png",
  },
  {
    name: "NFT.NYC Conference",
    date: "MAY 08, 2024",
    price: "0.8 XLM",
    image: "/computer.png",
  },
  {
    name: "Crypto Art Expo",
    date: "JUN 12, 2024",
    price: "0.2 XLM",
    image: "/watchtower.png",
  },
];

const SECONDARY_LISTINGS: SecondaryListing[] = [
  {
    id: "listing-1",
    tokenId: "#0042",
    sellerAddress: "GDQP2K...Q2Q7M",
    askingPrice: 0.45,
    originalPrice: 0.5,
    currency: "XLM",
    listedAt: "2024-02-28T10:30:00Z",
    sellerRating: 4.8,
    transferCount: 1,
  },
  {
    id: "listing-2",
    tokenId: "#0108",
    sellerAddress: "GBZX4P...GW2Y",
    askingPrice: 0.65,
    originalPrice: 0.5,
    currency: "XLM",
    listedAt: "2024-02-27T14:20:00Z",
    sellerRating: 5.0,
    transferCount: 0,
  },
  {
    id: "listing-3",
    tokenId: "#0256",
    sellerAddress: "GCXKGR...8H3J",
    askingPrice: 0.55,
    originalPrice: 0.5,
    currency: "XLM",
    listedAt: "2024-02-26T09:15:00Z",
    transferCount: 2,
  },
  {
    id: "listing-4",
    tokenId: "#0089",
    sellerAddress: "GDHKJW...9K2L",
    askingPrice: 0.4,
    originalPrice: 0.5,
    currency: "XLM",
    listedAt: "2024-02-25T16:45:00Z",
    sellerRating: 4.5,
    transferCount: 1,
  },
];

export default function EventDetailPage() {
  const [quantity, setQuantity] = useState(1);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleBuyFromSecondary = async (listing: SecondaryListing) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Purchased:", listing.tokenId);
  };

  const handleBuyPrimary = async () => {
    setIsPurchasing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPurchasing(false);
    setIsBuyModalOpen(false);
    console.log("Purchased:", quantity, "tickets");
  };

  const totalPrice = EVENT.price * quantity;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto md:px-0">
        {/* Event Header */}
        <div className="border border-t-0 corner-accents">
          <div className="grid grid-cols-1 md:grid-cols-4 md:divide-x">
            <div className="md:col-span-3 p-8 md:p-12 space-y-4 border-b md:border-b-0">
              <div className="flex items-center gap-2">
                <div className="bg-accent/10 text-accent px-2 py-1 text-xs font-bold rounded">
                  {EVENT.status}
                </div>
                <div className="text-xs text-muted-foreground border px-2 py-1 rounded">
                  {EVENT.category}
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
                {EVENT.name}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border corner-accents p-2 hover:bg-muted/30 transition-colors">
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="text-sm font-medium mt-1">{EVENT.date}</div>
                </div>
                <div className="border corner-accents p-3 hover:bg-muted/30 transition-colors">
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div className="text-sm font-medium mt-1">{EVENT.time}</div>
                </div>
                <div className="border corner-accents p-3 hover:bg-muted/30 transition-colors">
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div className="text-sm truncate font-medium mt-1">
                    {EVENT.location}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col divide-y">
              <div className="p-6 flex-1 flex flex-col justify-center items-center hover:bg-muted/30 transition-colors cursor-pointer">
                <Share2 className="w-6 h-6 text-accent mb-2" />
                <span className="text-xs">Share</span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center items-center hover:bg-muted/30 transition-colors cursor-pointer">
                <Heart className="w-6 h-6 text-accent mb-2" />
                <span className="text-xs">Save</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="border border-t-0 corner-accents grid grid-cols-1 md:grid-cols-3 md:divide-x">
          {/* Left Column - Event Details */}
          <div className="md:col-span-2 p-6 md:p-8 space-y-6 border-b md:border-b-0">
            {/* Event Image */}
            <div className="aspect-video border corner-accents overflow-hidden bg-black">
              <div
                className="w-full h-full bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${EVENT.image})` }}
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold">ABOUT THIS EVENT</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {EVENT.description}
              </p>
            </div>

            {/* Perks */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold">WHAT&apos;S INCLUDED</h2>
              <div className="border corner-accents grid grid-cols-1 md:grid-cols-2 divide-x divide-y">
                {EVENT.perks.map((perk, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-sm p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Organizer */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold">ORGANIZED BY</h2>
              <div className="border corner-accents grid grid-cols-1 md:grid-cols-3 md:divide-x">
                <div className="md:col-span-2 p-4 flex items-center gap-3 border-b md:border-b-0">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {EVENT.organizer.name}
                      </span>
                      {EVENT.organizer.verified && (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {EVENT.organizer.address}
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-center hover:bg-muted/30 transition-colors cursor-pointer">
                  <span className="text-sm font-medium">View Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase */}
          <div className="md:col-span-1 flex flex-col divide-y">
            <div className="p-6 hover:bg-muted/30 transition-colors">
              <div className="text-xs text-muted-foreground">TICKET PRICE</div>
              <div className="text-3xl font-bold text-accent mt-1">
                {EVENT.price} {EVENT.currency}
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x">
              <div className="p-4 hover:bg-muted/30 transition-colors">
                <div className="text-xs text-muted-foreground">Available</div>
                <div className="text-2xl font-bold mt-1">{EVENT.available}</div>
              </div>
              <div className="p-4 hover:bg-muted/30 transition-colors">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-2xl font-bold mt-1">{EVENT.total}</div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <div className="flex items-center border corner-accents">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 hover:bg-muted/30 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="px-3 py-1 hover:bg-muted/30 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsBuyModalOpen(true)}
                className="w-full border corner-accents flex hover:bg-accent hover:text-white cursor-pointer transition-colors items-center justify-center gap-2 px-4 py-3 bg-accent/5"
              >
                <span className="text-sm font-medium">Buy Ticket</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex-1">
              <div className="text-xs font-bold mb-3">TICKET FEATURES</div>
              <div className="space-y-2 text-xs">
                {[
                  "Transferable NFT",
                  "On-chain verification",
                  "Resell anytime",
                  "Lifetime access",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <div className="w-1 h-1 rounded-full bg-accent" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Market */}
        <SecondaryMarket
          listings={SECONDARY_LISTINGS}
          originalPrice={EVENT.price}
          eventInfo={{ name: EVENT.name, image: EVENT.image }}
          onBuy={handleBuyFromSecondary}
        />

        {/* Similar Events */}
        <div className="border border-t-0 corner-accents">
          <div className="p-6 md:p-8 border-b">
            <h2 className="text-2xl font-bold tracking-tight">
              SIMILAR EVENTS
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-y md:divide-y-0">
            {SIMILAR_EVENTS.map((similar) => (
              <div
                key={similar.name}
                className="p-6 hover:bg-muted/30 transition-colors group cursor-pointer flex flex-col"
              >
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="aspect-square border corner-accents overflow-hidden bg-black">
                    <div
                      className="w-full h-full bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${similar.image})` }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold tracking-tight group-hover:text-accent transition-colors">
                      {similar.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {similar.date}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 divide-x border corner-accents mt-auto">
                    <div className="p-2">
                      <div className="text-xs text-muted-foreground">Price</div>
                      <div className="font-bold text-accent text-sm">
                        {similar.price}
                      </div>
                    </div>
                    <div className="p-2 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-accent" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buy Primary Ticket Modal */}
      <ResponsiveModal
        open={isBuyModalOpen}
        onOpenChange={(o) => !isPurchasing && setIsBuyModalOpen(o)}
        title="Buy Tickets"
        description={`Purchase ${quantity} ticket${
          quantity > 1 ? "s" : ""
        } for ${EVENT.name}`}
        icon={
          <div
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10"
          >
            <Ticket className="size-5 text-accent" />
          </div>
        }
      >
        <ResponsiveModalContent>
          {/* Event Preview */}
          <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/5">
            <div
              className="w-14 h-14 rounded-lg border bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${EVENT.image})` }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{EVENT.name}</p>
              <p className="text-xs text-muted-foreground">{EVENT.date}</p>
              <p className="text-xs text-muted-foreground truncate">
                {EVENT.location}
              </p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
              <span className="text-muted-foreground text-xs">
                Order Summary
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per ticket</span>
                <span className="font-mono">
                  {EVENT.price.toFixed(2)} {EVENT.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-mono">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-mono text-muted-foreground">
                  ~0.01 XLM
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t font-medium">
                <span>Total</span>
                <span className="font-mono font-bold text-accent">
                  {(totalPrice + 0.01).toFixed(2)} {EVENT.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-accent flex-shrink-0" />
              <span>NFT tickets minted on Stellar</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-3 h-3 text-accent flex-shrink-0" />
              <span>Resellable on secondary market</span>
            </div>
          </div>

          <ResponsiveModalFooter className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setIsBuyModalOpen(false)}
              disabled={isPurchasing}
              className="flex-1"
            >
              Cancel
            </Button>
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
                <>
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Pay {totalPrice.toFixed(2)} {EVENT.currency}
                </>
              )}
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>

        <p className="text-center text-muted-foreground text-xs mt-4">
          Secure transaction powered by Stellar
        </p>
      </ResponsiveModal>
    </MainLayout>
  );
}
