"use client";

import { useState, useCallback } from "react";
import { useFreighter } from "@/providers/FreighterProvider";
import {
  Client as NftClient,
  networks,
} from "../../sticket-contracts/packages/sticket-nft-collections/src/index";
import type {
  Ticket,
  UseTicketActionsReturn,
} from "@/components/tickets/types";

// Convert price to stroops (1 XLM = 10^7 stroops)
function toStroops(price: number): bigint {
  return BigInt(Math.floor(price * 10_000_000));
}

// Create NFT client for a specific contract
function createNftClient(
  contractId: string,
  publicKey: string,
  signTransaction: (
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ) => Promise<{ signedTxXdr: string; signerAddress: string }>,
  signAuthEntry: (
    entryXdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ) => Promise<{ signedAuthEntry: string | null; signerAddress: string }>
) {
  return new NftClient({
    contractId,
    networkPassphrase: networks.testnet.networkPassphrase,
    rpcUrl: "https://soroban-testnet.stellar.org",
    publicKey,
    signTransaction: async (xdr: string) => {
      console.log("Signing transaction...");
      const result = await signTransaction(xdr, {
        networkPassphrase: networks.testnet.networkPassphrase,
        address: publicKey,
      });
      console.log("Transaction signed");
      return {
        signedTxXdr: result.signedTxXdr,
        signerAddress: result.signerAddress,
      };
    },
    signAuthEntry: async (entryXdr: string) => {
      console.log("Signing auth entry...");
      const result = await signAuthEntry(entryXdr, {
        networkPassphrase: networks.testnet.networkPassphrase,
        address: publicKey,
      });
      console.log(
        "Auth entry signed:",
        result.signedAuthEntry ? "success" : "null"
      );
      // Return the signed auth entry or throw if null
      if (!result.signedAuthEntry) {
        throw new Error("Failed to sign auth entry");
      }
      return {
        signedAuthEntry: result.signedAuthEntry,
        signerAddress: result.signerAddress,
      };
    },
  });
}

export function useTicketActions(): UseTicketActionsReturn {
  const { publicKey, signTransaction, signAuthEntry } = useFreighter();
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

      if (!publicKey) {
        setError("Wallet not connected");
        throw new Error("Wallet not connected");
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Create NFT client for this ticket's contract
        const nftClient = createNftClient(
          selectedTicket.contractAddress,
          publicKey,
          signTransaction,
          signAuthEntry
        );

        // Extract ticket_id (u32) from tokenId
        const ticketId = parseInt(
          selectedTicket.tokenId.replace(/\D/g, ""),
          10
        );

        console.log("Sending ticket:", {
          from: publicKey,
          to: toAddress,
          ticketId,
          contractAddress: selectedTicket.contractAddress,
        });

        // Call transfer_ticket on the contract
        const tx = await nftClient.transfer_ticket({
          from: publicKey,
          to: toAddress,
          ticket_id: ticketId,
        });

        // Sign and submit the transaction
        await tx.signAndSend();

        console.log("Ticket transfer successful!");
      } catch (err) {
        console.error("Transfer error:", err);
        const message = err instanceof Error ? err.message : "Transfer failed";
        setError(message);
        throw new Error(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedTicket, publicKey, signTransaction, signAuthEntry]
  );

  const listTicket = useCallback(
    async (price: number, currency: "XLM" | "USDC"): Promise<void> => {
      if (!selectedTicket) {
        setError("No ticket selected");
        throw new Error("No ticket selected");
      }

      if (!publicKey) {
        setError("Wallet not connected");
        throw new Error("Wallet not connected");
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Create NFT client for this ticket's contract
        const nftClient = createNftClient(
          selectedTicket.contractAddress,
          publicKey,
          signTransaction,
          signAuthEntry
        );

        // Extract ticket_id (u32) from tokenId
        const ticketIdStr = selectedTicket.tokenId.replace(/\D/g, "");
        const ticketId = parseInt(ticketIdStr, 10);

        if (isNaN(ticketId) || ticketId < 0) {
          throw new Error(`Invalid ticket ID: ${selectedTicket.tokenId}`);
        }

        // Pre-check: Verify ticket ownership and status
        console.log("Pre-check: Verifying ticket status...");
        try {
          const ticketTx = await nftClient.get_ticket({ ticket_id: ticketId });
          const ticketResult = await ticketTx.simulate();
          const ticketData = ticketResult.result as {
            owner: string;
            is_used: boolean;
            ticket_id: number;
          };

          console.log("Ticket data:", ticketData);

          if (ticketData.owner !== publicKey) {
            throw new Error(
              `You don't own this ticket. Owner: ${ticketData.owner.slice(
                0,
                8
              )}...`
            );
          }

          if (ticketData.is_used) {
            throw new Error("Cannot list a used ticket");
          }
        } catch (preCheckErr) {
          if (
            preCheckErr instanceof Error &&
            preCheckErr.message.includes("don't own")
          ) {
            throw preCheckErr;
          }
          if (
            preCheckErr instanceof Error &&
            preCheckErr.message.includes("used ticket")
          ) {
            throw preCheckErr;
          }
          console.warn("Pre-check failed, continuing anyway:", preCheckErr);
        }

        // Convert price to stroops (i128)
        const priceInStroops = toStroops(price);

        if (priceInStroops <= BigInt(0)) {
          throw new Error("Price must be greater than 0");
        }

        // Pre-check: Check if already listed
        let isAlreadyListed = false;
        try {
          const listingTx = await nftClient.get_secondary_listing({
            ticket_id: ticketId,
          });
          const listingResult = await listingTx.simulate();
          const listing = listingResult.result;

          // If listing exists and is not None/null, the ticket is already listed
          if (listing && typeof listing === "object" && "seller" in listing) {
            isAlreadyListed = true;
            console.log("Ticket is already listed, will update price instead");
          }
        } catch (listingCheckErr) {
          // If listing check fails (e.g., no listing exists), that's fine
          console.log(
            "No existing listing found, will create new listing",
            listingCheckErr
          );
        }

        if (isAlreadyListed) {
          // Update existing listing price
          console.log("Updating listing price:", {
            seller: publicKey,
            ticketId,
            newPrice: priceInStroops.toString(),
            contractAddress: selectedTicket.contractAddress,
          });

          const tx = await nftClient.update_listing_price({
            seller: publicKey,
            ticket_id: ticketId,
            new_price: priceInStroops,
          });

          await tx.signAndSend();
          console.log("Listing price updated successfully!");
        } else {
          // Create new listing
          console.log("Listing ticket:", {
            seller: publicKey,
            ticketId,
            ticketIdType: typeof ticketId,
            price: priceInStroops.toString(),
            priceType: typeof priceInStroops,
            currency,
            contractAddress: selectedTicket.contractAddress,
          });

          const tx = await nftClient.list_ticket({
            seller: publicKey,
            ticket_id: ticketId,
            price: priceInStroops,
          });

          await tx.signAndSend();
          console.log("Ticket listed successfully!");
        }
      } catch (err) {
        console.error("Listing error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Listing failed";

        // Parse common contract errors for better UX
        let friendlyMessage = errorMessage;
        if (errorMessage.includes("UnreachableCodeReached")) {
          friendlyMessage =
            "Contract validation failed. This could mean:\n" +
            "• You don't own this ticket\n" +
            "• The ticket is already listed\n" +
            "• The ticket has been used";
        }

        setError(friendlyMessage);
        throw new Error(friendlyMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedTicket, publicKey, signTransaction, signAuthEntry]
  );

  const cancelListing = useCallback(async (): Promise<void> => {
    if (!selectedTicket) {
      setError("No ticket selected");
      throw new Error("No ticket selected");
    }

    if (!publicKey) {
      setError("Wallet not connected");
      throw new Error("Wallet not connected");
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create NFT client for this ticket's contract
      const nftClient = createNftClient(
        selectedTicket.contractAddress,
        publicKey,
        signTransaction,
        signAuthEntry
      );

      // Extract ticket_id (u32) from tokenId
      const ticketId = parseInt(selectedTicket.tokenId.replace(/\D/g, ""), 10);

      console.log("Canceling listing:", {
        seller: publicKey,
        ticketId,
        contractAddress: selectedTicket.contractAddress,
      });

      // Call delist_ticket on the contract
      const tx = await nftClient.delist_ticket({
        seller: publicKey,
        ticket_id: ticketId,
      });

      // Sign and submit the transaction
      await tx.signAndSend();

      console.log("Listing canceled successfully!");
    } catch (err) {
      console.error("Cancel listing error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to cancel listing";
      setError(message);
      throw new Error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTicket, publicKey, signTransaction, signAuthEntry]);

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
