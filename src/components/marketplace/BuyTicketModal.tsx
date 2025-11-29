"use client";

import { ArrowUpRight, Loader2, ShieldCheck, TrendingUp, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { getPriceDiff, type BuyTicketModalProps } from "./types";

export function BuyTicketModal({
  open,
  onOpenChange,
  listing,
  eventInfo,
  onConfirm,
  isLoading = false,
}: BuyTicketModalProps) {
  if (!listing) return null;

  const priceDiff = getPriceDiff(listing.askingPrice, listing.originalPrice);
  const isBelow = priceDiff < 0;
  const isAbove = priceDiff > 0;

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => !isLoading && onOpenChange(o)}
      title="Buy Ticket"
      description={`Purchase ${listing.tokenId} from secondary market`}
      icon={
        <div
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10"
        >
          <Tag className="size-5 text-accent" />
        </div>
      }
    >
      <ResponsiveModalContent>
        {/* Ticket Preview */}
        <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/5">
          <div
            className="w-14 h-14 rounded-lg border bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${eventInfo.image})` }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{eventInfo.name}</p>
            <p className="text-xs text-accent font-mono">{listing.tokenId}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Seller: {listing.sellerAddress}
            </p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            <span className="text-muted-foreground text-xs">Price Breakdown</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket Price</span>
              <span className="font-mono font-bold">
                {listing.askingPrice.toFixed(2)} {listing.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Price</span>
              <span className="font-mono text-muted-foreground">
                {listing.originalPrice.toFixed(2)} {listing.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difference</span>
              <span
                className={`font-mono ${
                  isBelow ? "text-green-500" : isAbove ? "text-yellow-500" : ""
                }`}
              >
                {isBelow ? "↓" : isAbove ? "↑" : ""}
                {Math.abs(priceDiff).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network Fee</span>
              <span className="font-mono text-muted-foreground">~0.01 XLM</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-medium">
              <span>Total</span>
              <span className="font-mono font-bold text-accent">
                {(listing.askingPrice + 0.01).toFixed(2)} {listing.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-accent flex-shrink-0" />
            <span>Verified on Stellar blockchain</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-accent flex-shrink-0" />
            <span>5% royalty to event creator</span>
          </div>
        </div>

        <ResponsiveModalFooter className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Buy for {listing.askingPrice.toFixed(2)} {listing.currency}
              </>
            )}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>

      <p className="text-center text-muted-foreground text-xs mt-4">
        Secure transaction powered by Stellar
      </p>
    </ResponsiveModal>
  );
}

