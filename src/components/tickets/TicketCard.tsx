"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { TicketImage } from "./TicketImage";
import { TicketInfo } from "./TicketInfo";
import { TicketActions } from "./TicketActions";
import type { TicketCardProps, ViewTicketParams } from "./types";

export function TicketCard({
  ticket,
  variant = "active",
  onView,
  onSend,
  onSell,
  onCancelListing,
  onDownload,
  isLoading = false,
  className,
}: TicketCardProps) {
  const isPast = variant === "past";
  const isCompact = variant === "compact";

  // Build action params
  const viewParams: ViewTicketParams = {
    ticketId: ticket.id,
    tokenId: ticket.tokenId,
    contractAddress: ticket.contractAddress,
  };

  // Action handlers
  const handleView = () => onView?.(viewParams);

  const handleSend = () => {
    onSend?.({
      ...viewParams,
      fromAddress: ticket.ownerAddress,
      toAddress: "", // Will be filled in modal
    });
  };

  const handleSell = () => {
    onSell?.({
      ...viewParams,
      ownerAddress: ticket.ownerAddress,
      askingPrice: ticket.currentPrice || ticket.originalPrice,
      currency: ticket.currency === "ETH" ? "XLM" : ticket.currency,
    });
  };

  const handleCancelListing = () => {
    if (ticket.listingId) {
      onCancelListing?.({
        ticketId: ticket.id,
        listingId: ticket.listingId,
        ownerAddress: ticket.ownerAddress,
      });
    }
  };

  const handleDownload = () => onDownload?.(ticket.id);

  return (
    <div
      className={cn(
        "p-6 hover:bg-muted/30 transition-colors group flex flex-col relative",
        isPast && "opacity-60",
        className
      )}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="text-xs font-bold">[PROCESSING...]</span>
          </div>
        </div>
      )}

      <div className="space-y-4 flex-1 flex flex-col">
        {/* Ticket Image */}
        <TicketImage
          src={ticket.image}
          alt={ticket.eventName}
          status={ticket.status}
          category={ticket.category}
          tokenId={isCompact ? undefined : ticket.tokenId}
          variant={variant}
        />

        {/* Ticket Info */}
        <TicketInfo
          ticket={ticket}
          variant={variant}
          showPrice={ticket.isListed}
          className="flex-1"
        />

        {/* Actions */}
        <TicketActions
          ticket={ticket}
          variant={variant}
          onView={handleView}
          onSend={handleSend}
          onSell={handleSell}
          onCancelListing={handleCancelListing}
          onDownload={handleDownload}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

export default TicketCard;
