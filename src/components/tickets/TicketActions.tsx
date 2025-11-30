"use client";

import { cn } from "@/lib/utils";
import {
  QrCode,
  Send,
  ArrowUpRight,
  Download,
  XCircle,
  Loader2,
} from "lucide-react";
import type { TicketActionsProps } from "./types";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger" | "success";
  loading?: boolean;
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  variant = "default",
  loading,
}: ActionButtonProps) {
  const variants = {
    default: "hover:bg-muted text-white",
    danger: "hover:bg-destructive/5 text-destructive",
    success: "hover:bg-green-500/5 text-green-500",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "p-3 flex flex-col items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant]
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <span className={cn("w-4 h-4", variants[variant])}>{icon}</span>
      )}
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}

export function TicketActions({
  ticket,
  variant = "active",
  onView,
  onSend,
  onSell,
  onCancelListing,
  onDownload,
  disabled,
}: TicketActionsProps) {
  const isPast = variant === "past";
  const isListed = ticket.isListed || ticket.status === "LISTED";

  // Past tickets only have download action
  if (isPast) {
    return (
      <div className="border corner-accents">
        <button
          type="button"
          onClick={onDownload}
          disabled={disabled}
          className="w-full p-3 flex items-center justify-center gap-2 hover:bg-accent/5 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold">[DOWNLOAD]</span>
        </button>
      </div>
    );
  }

  // Listed tickets have different actions - VIEW and DELIST only
  if (isListed) {
    return (
      <div className="grid grid-cols-2 divide-x border corner-accents">
        <ActionButton
          icon={<QrCode className="w-4 h-4" />}
          label="[VIEW]"
          onClick={onView}
          disabled={disabled}
        />
        <ActionButton
          icon={<XCircle className="w-4 h-4" />}
          label="[DELIST]"
          onClick={onCancelListing || (() => {})}
          disabled={disabled || !onCancelListing}
          variant="danger"
        />
      </div>
    );
  }

  // Active tickets have all actions
  return (
    <div className="grid grid-cols-3 divide-x border corner-accents">
      <ActionButton
        icon={<QrCode className="w-4 h-4" />}
        label="[VIEW]"
        onClick={onView}
        disabled={disabled}
      />
      <ActionButton
        icon={<Send className="w-4 h-4" />}
        label="[SEND]"
        onClick={onSend}
        disabled={disabled}
      />
      <ActionButton
        icon={<ArrowUpRight className="w-4 h-4" />}
        label="[SELL]"
        onClick={onSell}
        disabled={disabled}
      />
    </div>
  );
}

export default TicketActions;
