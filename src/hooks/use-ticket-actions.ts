"use client";

import { useState, useCallback } from "react";
import type {
  Ticket,
  UseTicketActionsReturn,
} from "@/components/tickets/types";

export function useTicketActions(): UseTicketActionsReturn {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeModal, setActiveModal] = useState<
    "view" | "send" | "sell" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal handlers
  const openViewModal = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveModal("view");
    setError(null);
  }, []);

  const openSendModal = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveModal("send");
    setError(null);
  }, []);

  const openSellModal = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveModal("sell");
    setError(null);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setError(null);
    // Delay clearing selected ticket to allow for animation
    setTimeout(() => setSelectedTicket(null), 200);
  }, []);

  // Transaction handlers
  const sendTicket = useCallback(
    async (toAddress: string): Promise<void> => {
      if (!selectedTicket) {
        setError("No ticket selected");
        throw new Error("No ticket selected");
      }

      setIsProcessing(true);
      setError(null);

      try {
        // TODO: Implement actual Stellar/Soroban transaction
        // 1. Build transfer transaction
        // 2. Sign with Freighter
        // 3. Submit to network

        console.log("Sending ticket:", {
          ticketId: selectedTicket.id,
          tokenId: selectedTicket.tokenId,
          contractAddress: selectedTicket.contractAddress,
          toAddress,
        });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // On success, update local state
        // In production, this would be handled by a state manager or refetch
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transfer failed";
        setError(message);
        throw new Error(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedTicket]
  );

  const listTicket = useCallback(
    async (price: number, currency: "XLM" | "USDC"): Promise<void> => {
      if (!selectedTicket) {
        setError("No ticket selected");
        throw new Error("No ticket selected");
      }

      setIsProcessing(true);
      setError(null);

      try {
        // TODO: Implement actual marketplace listing
        // 1. Approve marketplace contract
        // 2. Create listing transaction
        // 3. Sign with Freighter
        // 4. Submit to network

        console.log("Listing ticket:", {
          ticketId: selectedTicket.id,
          tokenId: selectedTicket.tokenId,
          price,
          currency,
        });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Listing failed";
        setError(message);
        throw new Error(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedTicket]
  );

  const cancelListing = useCallback(async (): Promise<void> => {
    if (!selectedTicket || !selectedTicket.listingId) {
      setError("No active listing found");
      throw new Error("No active listing found");
    }

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement actual listing cancellation
      // 1. Build cancel transaction
      // 2. Sign with Freighter
      // 3. Submit to network

      console.log("Canceling listing:", {
        ticketId: selectedTicket.id,
        listingId: selectedTicket.listingId,
      });

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to cancel listing";
      setError(message);
      throw new Error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTicket]);

  // Utility functions
  const generateQRCode = useCallback((ticket: Ticket): string => {
    // Generate QR code data for check-in
    const qrData = {
      type: "STICKET_CHECKIN",
      ticketId: ticket.id,
      tokenId: ticket.tokenId,
      contractAddress: ticket.contractAddress,
      eventName: ticket.eventName,
      eventDate: ticket.eventDate,
      ownerAddress: ticket.ownerAddress,
      timestamp: Date.now(),
    };

    return JSON.stringify(qrData);
  }, []);

  const downloadTicket = useCallback((ticket: Ticket) => {
    // TODO: Generate and download ticket as image/PDF
    console.log("Downloading ticket:", ticket.id);

    // For now, create a simple JSON download
    const data = {
      ticketId: ticket.id,
      tokenId: ticket.tokenId,
      eventName: ticket.eventName,
      eventDate: ticket.eventDate,
      eventTime: ticket.eventTime,
      location: ticket.location,
      category: ticket.category,
      ownerAddress: ticket.ownerAddress,
      contractAddress: ticket.contractAddress,
      status: ticket.status,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ticket-${ticket.tokenId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    // State
    selectedTicket,
    activeModal,
    isProcessing,
    error,

    // Actions
    openViewModal,
    openSendModal,
    openSellModal,
    closeModal,

    // Transactions
    sendTicket,
    listTicket,
    cancelListing,

    // Utilities
    generateQRCode,
    downloadTicket,
  };
}

export default useTicketActions;
