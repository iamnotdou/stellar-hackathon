"use client";

import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { Download, ExternalLink, Copy, Check, QrCode } from "lucide-react";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { ViewTicketModalProps } from "../types";

export function ViewTicketModal({
  open,
  onOpenChange,
  ticket,
  onDownload,
}: ViewTicketModalProps) {
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEEE, MMMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = `https://stellar.expert/explorer/public/account/${ticket.contractAddress}`;

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Ticket Details"
      description={`${ticket.tokenId} • ${ticket.status}`}
      icon={
        <div
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10"
        >
          <QrCode className="size-5 text-accent" />
        </div>
      }
    >
      <ResponsiveModalContent>
        {/* QR Code Section */}
        <div className="rounded-lg border bg-white p-6 flex flex-col items-center justify-center">
          <div className="w-40 h-40 bg-muted/20 border rounded-lg flex items-center justify-center">
            {/* Placeholder QR - replace with actual QR code library */}
            <div className="text-center p-4">
              <div className="grid grid-cols-5 gap-1 w-28 h-28 mx-auto">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm ${
                      Math.random() > 0.5 ? "bg-black" : "bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-black mt-3 font-medium">
            Scan at venue for check-in
          </p>
        </div>

        {/* Event Info */}
        <div className="space-y-3">
          <div className="*:not-first:mt-1">
            <p className="text-xs text-muted-foreground">Event</p>
            <p className="font-medium">{ticket.eventName}</p>
          </div>
          <div className="*:not-first:mt-1">
            <p className="text-xs text-muted-foreground">Date & Time</p>
            <p className="font-medium">
              {formatDate(ticket.eventDate)} at {ticket.eventTime}
            </p>
          </div>
          <div className="*:not-first:mt-1">
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-medium">{ticket.location}</p>
          </div>
          <div className="*:not-first:mt-1">
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="font-medium text-accent">{ticket.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          <span className="text-muted-foreground text-xs">Contract</span>
        </div>

        {/* Contract Info */}
        <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/5">
          <p className="font-mono text-xs truncate max-w-[200px]">
            {ticket.contractAddress}
          </p>
          <button
            onClick={() => copyToClipboard(ticket.contractAddress)}
            className="p-2 hover:bg-accent/10 rounded-md transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Actions */}
        <ResponsiveModalFooter className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onDownload} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(explorerUrl, "_blank")}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Explorer
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>

      <p className="text-center text-muted-foreground text-xs mt-4">
        Token ID: {ticket.tokenId} • Owned by you
      </p>
    </ResponsiveModal>
  );
}

export default ViewTicketModal;
