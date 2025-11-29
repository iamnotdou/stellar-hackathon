"use client";

import { cn } from "@/lib/utils";
import type { TicketImageProps } from "./types";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-accent/10 text-accent border-accent/30",
  USED: "bg-muted text-muted-foreground border-muted",
  EXPIRED: "bg-destructive/10 text-destructive border-destructive/30",
  TRANSFERRED: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  LISTED: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
};

export function TicketImage({
  src,
  alt,
  status,
  category,
  tokenId,
  variant = "active",
  className,
}: TicketImageProps) {
  const isPast = variant === "past";
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "relative border corner-accents overflow-hidden bg-black",
        isCompact ? "aspect-square" : "aspect-video",
        className
      )}
      role="img"
      aria-label={alt}
    >
      {/* Background Image */}
      <div
        className={cn(
          "w-full h-full bg-contain bg-center bg-no-repeat transition-all",
          isPast && "grayscale opacity-60"
        )}
        style={{ backgroundImage: `url(${src})` }}
      />

      {/* Status Badge */}
      <div
        className={cn(
          "absolute top-3 left-3 border corner-accents px-2 py-1 text-xs font-bold backdrop-blur-sm",
          statusColors[status] || statusColors.ACTIVE
        )}
      >
        [{status}]
      </div>

      {/* Category Badge */}
      {!isCompact && (
        <div className="absolute top-3 right-3 text-xs border corner-accents px-2 py-1 bg-black/80 backdrop-blur-sm">
          {category.toUpperCase()}
        </div>
      )}

      {/* Token ID Badge (bottom) */}
      {tokenId && !isCompact && (
        <div className="absolute bottom-3 right-3 text-xs font-mono border corner-accents px-2 py-1 bg-black/80 backdrop-blur-sm text-accent">
          {tokenId}
        </div>
      )}

      {/* Listed Overlay */}
      {status === "LISTED" && (
        <div className="absolute inset-0 bg-yellow-500/5 border-2 border-yellow-500/20" />
      )}
    </div>
  );
}

export default TicketImage;
