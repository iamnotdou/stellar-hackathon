"use client";

import { useState, useMemo, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import {
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Tag,
} from "lucide-react";
import type { SellTicketModalProps } from "../types";

type Step = "input" | "confirm" | "success";

export function SellTicketModal({
  open,
  onOpenChange,
  ticket,
  // ownerAddress - reserved for future use (approval flow)
  onSell,
  isLoading = false,
  platformFeeBps = 250, // 2.5% default
}: SellTicketModalProps) {
  const id = useId();
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"XLM" | "USDC">("XLM");
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);

  // Calculate fees - must be before conditional return
  const priceValue = parseFloat(price) || 0;
  const royaltyBps = ticket?.royaltyBps || 500; // 5% default

  const calculations = useMemo(() => {
    const royaltyFee = (priceValue * royaltyBps) / 10000;
    const platformFee = (priceValue * platformFeeBps) / 10000;
    const netProceeds = priceValue - royaltyFee - platformFee;

    return {
      royaltyFee,
      platformFee,
      netProceeds: Math.max(0, netProceeds),
      royaltyPercent: (royaltyBps / 100).toFixed(1),
      platformPercent: (platformFeeBps / 100).toFixed(1),
    };
  }, [priceValue, royaltyBps, platformFeeBps]);

  // Early return after hooks
  if (!ticket) return null;

  const handleContinue = () => {
    setError(null);

    if (!price || priceValue <= 0) {
      setError("Please enter a valid price");
      return;
    }

    if (priceValue < 0.01) {
      setError("Minimum price is 0.01");
      return;
    }

    setStep("confirm");
  };

  const handleSell = async () => {
    try {
      await onSell(priceValue, currency);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Listing failed");
      setStep("input");
    }
  };

  const handleClose = () => {
    setPrice("");
    setCurrency("XLM");
    setStep("input");
    setError(null);
    onOpenChange(false);
  };

  const getTitle = () => {
    if (step === "success") return "Listing Created";
    return "List for Sale";
  };

  const getDescription = () => {
    if (step === "success") return `${ticket.tokenId} is now on marketplace`;
    return `Set your price for ${ticket.tokenId}`;
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
          <Tag className="size-5 text-accent" />
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
              <p className="text-xs text-accent mt-1">
                Original: {ticket.originalPrice} {ticket.currency}
              </p>
            </div>
          </div>

          {/* Price Input */}
          <div className="*:not-first:mt-2">
            <Label htmlFor={`${id}-price`}>Asking Price</Label>
            <div className="flex gap-2">
              <Input
                id={`${id}-price`}
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="flex-1"
              />
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as "XLM" | "USDC")}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XLM">XLM</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs mt-2">
                <AlertTriangle className="w-3 h-3" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Fee Breakdown */}
          {priceValue > 0 && (
            <>
              <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                <span className="text-muted-foreground text-xs">
                  Fee Breakdown
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listing Price</span>
                  <span className="font-mono">
                    {priceValue.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Creator Royalty ({calculations.royaltyPercent}%)
                  </span>
                  <span className="font-mono text-yellow-500">
                    -{calculations.royaltyFee.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Platform Fee ({calculations.platformPercent}%)
                  </span>
                  <span className="font-mono text-yellow-500">
                    -{calculations.platformFee.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">You Receive</span>
                  <span className="font-mono font-bold text-accent">
                    {calculations.netProceeds.toFixed(2)} {currency}
                  </span>
                </div>
              </div>
            </>
          )}

          <ResponsiveModalFooter className="flex flex-col-reverse sm:flex-row gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              Continue
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && (
        <ResponsiveModalContent>
          {/* Listing Summary */}
          <div className="rounded-lg border p-4 bg-muted/5 text-center">
            <p className="text-xs text-muted-foreground mb-2">Listing Price</p>
            <p className="text-3xl font-bold text-accent">
              {priceValue.toFixed(2)} {currency}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              You will receive {calculations.netProceeds.toFixed(2)} {currency}{" "}
              after fees
            </p>
          </div>

          {/* Ticket Info */}
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <div
              className="w-12 h-12 rounded-lg border bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${ticket.image})` }}
            />
            <div>
              <p className="font-medium text-sm">{ticket.eventName}</p>
              <p className="text-xs text-accent">{ticket.tokenId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            <span className="text-muted-foreground text-xs">Info</span>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Your ticket will be listed on the marketplace</p>
            <p>• You can cancel the listing anytime</p>
            <p>• Payment will be sent to your wallet on sale</p>
          </div>

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
              onClick={handleSell}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  List for Sale
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
              Your ticket is now listed for
            </p>
            <p className="text-2xl font-bold text-accent">
              {priceValue.toFixed(2)} {currency}
            </p>
          </div>

          <div className="rounded-lg border p-3 bg-muted/5">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Listing is now live on marketplace</p>
              <p>• Buyers can purchase immediately</p>
              <p>• You&apos;ll be notified when sold</p>
            </div>
          </div>

          <ResponsiveModalFooter className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => window.open("/discover", "_blank")}
              className="w-full"
            >
              View Marketplace
            </Button>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      )}

      <p className="text-center text-muted-foreground text-xs mt-4">
        {step === "success"
          ? "Good luck with your sale!"
          : "Fees are deducted when the ticket sells."}
      </p>
    </ResponsiveModal>
  );
}

export default SellTicketModal;
