"use client";

import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import {
  AlertTriangle,
  Send,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { SendTicketModalProps } from "../types";

type Step = "input" | "confirm" | "success";

export function SendTicketModal({
  open,
  onOpenChange,
  ticket,
  senderAddress,
  onSend,
  isLoading = false,
}: SendTicketModalProps) {
  const id = useId();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);

  if (!ticket) return null;

  // Validate Stellar (G...) or EVM (0x...) address
  const validateAddress = (address: string): boolean => {
    const stellarRegex = /^G[A-Z0-9]{55}$/;
    const evmRegex = /^0x[a-fA-F0-9]{40}$/;
    return stellarRegex.test(address) || evmRegex.test(address);
  };

  const handleContinue = () => {
    setError(null);

    if (!recipientAddress.trim()) {
      setError("Please enter a recipient address");
      return;
    }

    if (!validateAddress(recipientAddress.trim())) {
      setError("Invalid wallet address format");
      return;
    }

    if (recipientAddress.trim() === senderAddress) {
      setError("Cannot send to your own address");
      return;
    }

    setStep("confirm");
  };

  const handleSend = async () => {
    try {
      await onSend(recipientAddress.trim());
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
      setStep("input");
    }
  };

  const handleClose = () => {
    setRecipientAddress("");
    setStep("input");
    setError(null);
    onOpenChange(false);
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 8)}...${addr.slice(-8)}`;

  const getTitle = () => {
    if (step === "success") return "Transfer Complete";
    return "Send Ticket";
  };

  const getDescription = () => {
    if (step === "success") return `${ticket.tokenId} successfully transferred`;
    return `Transfer ${ticket.tokenId} to another wallet`;
  };

  const getIcon = () => {
    const isSuccess = step === "success";
    return (
      <div
        aria-hidden="true"
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border ${
          isSuccess
            ? "border-green-500/30 bg-green-500/10"
            : "border-accent/30 bg-accent/10"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="size-5 text-green-500" />
        ) : (
          <Send className="size-5 text-accent" />
        )}
      </div>
    );
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={handleClose}
      title={getTitle()}
      description={getDescription()}
      icon={getIcon()}
    >
      {/* Step: Input */}
      {step === "input" && (
        <ResponsiveModalContent>
          {/* Ticket Preview */}
          <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/5">
            <div
              className="w-14 h-14 rounded-lg border bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${ticket.image})` }}
            />
            <div>
              <p className="font-medium text-sm">{ticket.eventName}</p>
              <p className="text-xs text-muted-foreground">{ticket.tokenId}</p>
            </div>
          </div>

          {/* Recipient Input */}
          <div className="*:not-first:mt-2">
            <Label htmlFor={`${id}-recipient`}>Recipient Address</Label>
            <Input
              id={`${id}-recipient`}
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="G... (Stellar) or 0x... (EVM)"
              className="font-mono text-sm"
            />
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs mt-2">
                <AlertTriangle className="w-3 h-3" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            <span className="text-muted-foreground text-xs">Warning</span>
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-yellow-500/20 p-3 bg-yellow-500/5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-600 dark:text-yellow-500">
                This action is irreversible. Make sure the recipient address is
                correct before proceeding.
              </p>
            </div>
          </div>

          <ResponsiveModalFooter className="flex flex-col-reverse sm:flex-row gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && (
        <ResponsiveModalContent>
          {/* Transfer Summary */}
          <div className="space-y-3 rounded-lg border p-4">
            <div className="*:not-first:mt-1">
              <p className="text-xs text-muted-foreground">From</p>
              <p className="font-mono text-sm">
                {truncateAddress(senderAddress)}
              </p>
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-accent" />
            </div>
            <div className="*:not-first:mt-1">
              <p className="text-xs text-muted-foreground">To</p>
              <p className="font-mono text-sm">
                {truncateAddress(recipientAddress)}
              </p>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="rounded-lg border p-3 bg-muted/5">
            <p className="text-xs text-muted-foreground mb-1">Ticket</p>
            <p className="font-medium">{ticket.eventName}</p>
            <p className="text-xs text-accent">{ticket.tokenId}</p>
          </div>

          <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            <span className="text-muted-foreground text-xs">Sign</span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Sign this transaction with your wallet to complete the transfer.
          </p>

          <ResponsiveModalFooter className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setStep("input")}
              disabled={isLoading}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSend}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Confirm
                </>
              )}
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      )}

      {/* Step: Success */}
      {step === "success" && (
        <ResponsiveModalContent>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Your ticket has been sent to
            </p>
            <p className="font-mono text-sm font-medium">
              {truncateAddress(recipientAddress)}
            </p>
          </div>

          <div className="rounded-lg border p-3 bg-muted/5">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Transaction submitted to network</p>
              <p>• Ticket ownership transferred</p>
              <p>• Recipient can now view in their wallet</p>
            </div>
          </div>

          <ResponsiveModalFooter>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      )}

      <p className="text-center text-muted-foreground text-xs mt-4">
        {step === "success"
          ? "The recipient now owns this ticket."
          : "Make sure you trust the recipient."}
      </p>
    </ResponsiveModal>
  );
}

export default SendTicketModal;
