"use client";

import { useState } from "react";
import { ArrowUpRight, Clock, ShieldCheck, Tag } from "lucide-react";
import { BuyTicketModal } from "./BuyTicketModal";
import {
  calculateMarketStats,
  formatTimeAgo,
  getPriceDiff,
  type SecondaryListing,
  type SecondaryMarketProps,
} from "./types";

// ============================================================================
// LISTING ROW
// ============================================================================

function ListingRow({
  listing,
  onBuy,
}: {
  listing: SecondaryListing;
  onBuy: (listing: SecondaryListing) => void;
}) {
  const priceDiff = getPriceDiff(listing.askingPrice, listing.originalPrice);
  const isBelow = priceDiff < 0;
  const isAbove = priceDiff > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-0 md:divide-x p-4 hover:bg-muted/30 transition-colors">
      {/* Token ID */}
      <div className="md:px-3">
        <div className="text-xs text-muted-foreground">TOKEN</div>
        <div className="font-bold font-mono text-accent">{listing.tokenId}</div>
      </div>

      {/* Price with diff */}
      <div className="md:px-3">
        <div className="text-xs text-muted-foreground">PRICE</div>
        <div className="flex items-center gap-2">
          <span className="font-bold">
            {listing.askingPrice.toFixed(2)} {listing.currency}
          </span>
          <span
            className={`text-xs font-medium ${
              isBelow
                ? "text-green-500"
                : isAbove
                ? "text-yellow-500"
                : "text-muted-foreground"
            }`}
          >
            {isBelow ? "↓" : isAbove ? "↑" : ""}
            {Math.abs(priceDiff).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Listed */}
      <div className="md:px-3">
        <div className="text-xs text-muted-foreground">LISTED</div>
        <div className="flex items-center gap-1 text-sm">
          <Clock className="w-3 h-3" />
          {formatTimeAgo(listing.listedAt)}
        </div>
      </div>

      {/* Action */}
      <div className="md:px-3 flex items-center col-span-2 md:col-span-1">
        <button
          onClick={() => onBuy(listing)}
          className="w-full border corner-accents flex hover:bg-accent hover:text-white cursor-pointer transition-colors items-center justify-center gap-2 px-4 py-2 bg-accent/5"
        >
          <span className="text-sm font-bold">[BUY]</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STATS BAR
// ============================================================================

function MarketStatsBar({
  floorPrice,
  avgPrice,
  listingsCount,
  originalPrice,
}: {
  floorPrice: number;
  avgPrice: number;
  listingsCount: number;
  originalPrice: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 divide-x border-b">
      <div className="p-4 hover:bg-muted/30 transition-colors">
        <div className="text-xs text-muted-foreground font-bold">[FLOOR]</div>
        <div className="text-xl font-bold text-accent mt-1">
          {floorPrice > 0 ? `${floorPrice.toFixed(2)} XLM` : "—"}
        </div>
      </div>
      <div className="p-4 hover:bg-muted/30 transition-colors">
        <div className="text-xs text-muted-foreground font-bold">[AVG]</div>
        <div className="text-xl font-bold mt-1">
          {avgPrice > 0 ? `${avgPrice.toFixed(2)} XLM` : "—"}
        </div>
      </div>
      <div className="p-4 hover:bg-muted/30 transition-colors">
        <div className="text-xs text-muted-foreground font-bold">[LISTED]</div>
        <div className="text-xl font-bold mt-1">{listingsCount}</div>
      </div>
      <div className="p-4 hover:bg-muted/30 transition-colors">
        <div className="text-xs text-muted-foreground font-bold">
          [ORIGINAL]
        </div>
        <div className="text-xl font-bold text-muted-foreground mt-1">
          {originalPrice.toFixed(2)} XLM
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState() {
  return (
    <div className="p-12 text-center">
      <div className="border corner-accents w-16 h-16 bg-muted/10 flex items-center justify-center mx-auto mb-4">
        <Tag className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-bold text-lg">[NO_LISTINGS]</h3>
      <p className="text-sm text-muted-foreground mt-1">
        No tickets listed for resale yet
      </p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SecondaryMarket({
  listings,
  originalPrice,
  eventInfo,
  onBuy,
}: SecondaryMarketProps) {
  const [selectedListing, setSelectedListing] =
    useState<SecondaryListing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const stats = calculateMarketStats(listings, originalPrice);

  const handleBuyClick = (listing: SecondaryListing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedListing) return;
    setIsPurchasing(true);
    try {
      await onBuy?.(selectedListing);
    } finally {
      setIsPurchasing(false);
      setIsModalOpen(false);
      setSelectedListing(null);
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!isPurchasing) {
      setIsModalOpen(open);
      if (!open) setSelectedListing(null);
    }
  };

  return (
    <>
      <div className="border border-t-0 corner-accents">
        {/* Header */}
        <div className="p-6 md:p-8 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Tag className="w-6 h-6 text-accent" />
                [SECONDARY_MARKET]
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Buy tickets from other holders
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {listings.length} listing{listings.length !== 1 ? "s" : ""}{" "}
              available
            </div>
          </div>
        </div>

        {/* Stats */}
        <MarketStatsBar {...stats} />

        {/* Listings */}
        {listings.length > 0 ? (
          <div className="divide-y">
            {listings.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                onBuy={handleBuyClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Footer */}
        <div className="p-4 border-t bg-muted/5">
          <div className="flex items-start gap-3 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground">
                [BUYER_PROTECTION]
              </span>{" "}
              All resale tickets are verified on-chain. Creator royalties (5%)
              are automatically distributed.
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      <BuyTicketModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        listing={selectedListing}
        eventInfo={eventInfo}
        onConfirm={handleConfirmPurchase}
        isLoading={isPurchasing}
      />
    </>
  );
}
