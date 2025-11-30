"use client";

import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { TicketInfoProps } from "./types";

export function TicketInfo({
  ticket,
  variant = "active",
  showPrice = false,
  className,
}: TicketInfoProps) {
  const isCompact = variant === "compact";
  const isPast = variant === "past";

  // Format date safely
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={cn("", isPast && "opacity-60", className)}>
      {/* Header with name and token ID */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3
          className={cn(
            "font-bold tracking-tight group-hover:text-accent transition-colors"
          )}
        >
          {ticket.eventName}
        </h3>
        {!isCompact && (
          <div className="text-xs text-accent font-mono border  px-2 py-0.5 bg-accent/5 shrink-0">
            {ticket.tokenId}
          </div>
        )}
      </div>

      {/* Event Details */}
      <div
        className={cn(
          "text-muted-foreground",
          isCompact ? "space-y-1 text-[10px]" : "space-y-1.5 text-xs"
        )}
      >
        <div className="flex items-start gap-2">
          <span className="text-accent">&gt;</span>
          <span>DATE: {formatDate(ticket.eventDate)}</span>
        </div>

        {!isCompact && (
          <>
            <div className="flex items-start gap-2">
              <span className="text-accent">&gt;</span>
              <span>TIME: {ticket.eventTime}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">&gt;</span>
              <span className="truncate">LOCATION: {ticket.location}</span>
            </div>
          </>
        )}

        {/* Price info for listed tickets */}
        {showPrice && ticket.isListed && ticket.currentPrice && (
          <div className="flex items-start gap-2 text-yellow-500">
            <span>&gt;</span>
            <span className="font-bold">
              LISTED: {ticket.currentPrice} {ticket.currency}
            </span>
          </div>
        )}

        {/* Token ID for compact */}
        {isCompact && (
          <div className="flex items-start gap-2">
            <span className="text-accent">&gt;</span>
            <span>TOKEN: {ticket.tokenId}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketInfo;
