"use client";

import { MainLayout } from "@/components/layouts";
import { useFreighter } from "@/providers/FreighterProvider";
import { usePinataUpload } from "@/hooks/use-pinata-upload";
import { toast } from "sonner";
import { useState } from "react";

import { CreateEventForm, type EventCreatePayload } from "./create-event-form";

export default function CreateEventPage() {
  const { publicKey, isConnected } = useFreighter();
  const { uploadMetadata } = usePinataUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload: EventCreatePayload) => {
    if (!isConnected || !publicKey) {
      toast.error("Please connect your wallet first", {
        description:
          "You need to connect your Freighter wallet to create an event.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload metadata to IPFS
      toast.loading("Uploading metadata to IPFS...", { id: "deploy" });

      let metadataUrl = "";
      try {
        const metadataResult = await uploadMetadata(
          payload.metadata as unknown as Record<string, unknown>,
          payload.name
        );
        metadataUrl = metadataResult.url;
        console.log("Metadata uploaded to IPFS:", metadataUrl);
      } catch (ipfsError) {
        console.warn(
          "IPFS metadata upload failed, continuing with local data:",
          ipfsError
        );
        // Continue without IPFS metadata URL
      }

      // Step 2: Deploy contract (TODO: Replace with actual contract deployment)
      toast.loading("Deploying contract...", { id: "deploy" });

      const finalPayload = {
        ...payload,
        metadataUri: metadataUrl || undefined, // IPFS URI for the metadata
      };

      console.log("Final Event Payload:", finalPayload);

      // Simulate deployment delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Event Created Successfully!", {
        id: "deploy",
        description: `Your event "${
          payload.name
        }" has been deployed to the blockchain.${
          metadataUrl ? ` Metadata: ${metadataUrl.slice(0, 40)}...` : ""
        }`,
      });
    } catch (error) {
      console.error("Deployment error:", error);
      toast.error("Failed to create event", {
        id: "deploy",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto md:px-0">
        {/* Header Section */}
        <div className="border border-t-0 corner-accents">
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
            <div
              style={{
                backgroundImage: `url(/cave.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              className="md:col-span-2 border-b md:border-b-0 relative"
            >
              {/* Gradient overlay - bottom to top */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              {/* Content */}
              <div className="relative z-10 p-8 md:p-12 space-y-4">
                <div className="inline-block border corner-accents bg-accent/5 text-accent px-3 py-1 text-xs font-bold">
                  [EVENT_CREATOR]
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                  Create Event
                </h1>
                <p className="text-muted-foreground text-sm">
                  &gt; DEPLOY_NEW_NFT_TICKET_CONTRACT
                </p>
              </div>
            </div>
            {/* Info */}
            <div className="flex flex-col divide-y">
              <div className="p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-xs text-muted-foreground mb-1">
                  PLATFORM_FEE
                </div>
                <div className="text-2xl font-bold text-accent">0%</div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-xs text-muted-foreground mb-1">
                  GAS_ESTIMATE
                </div>
                <div className="text-sm font-bold">~0.02 XLM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="border border-t-0 corner-accents">
          <CreateEventForm
            creatorAddress={publicKey || ""}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Tips Section */}
        <div className="border border-t-0 corner-accents">
          <div className="p-6 md:p-8 border-b">
            <h2 className="text-2xl font-bold tracking-tight">
              [BEST_PRACTICES]
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
            <div className="p-6 hover:bg-muted/30 transition-colors border-b md:border-b-0">
              <div className="space-y-2">
                <div className="text-sm font-bold text-accent">
                  [01] HIGH_QUALITY_IMAGE
                </div>
                <p className="text-xs text-muted-foreground">
                  Use clear, high-resolution images. This becomes the NFT
                  artwork and primary visual for your event.
                </p>
              </div>
            </div>
            <div className="p-6 hover:bg-muted/30 transition-colors border-b md:border-b-0">
              <div className="space-y-2">
                <div className="text-sm font-bold text-accent">
                  [02] CLEAR_DESCRIPTION
                </div>
                <p className="text-xs text-muted-foreground">
                  Include all important details. What, when, where, and what
                  attendees can expect from your event.
                </p>
              </div>
            </div>
            <div className="p-6 hover:bg-muted/30 transition-colors">
              <div className="space-y-2">
                <div className="text-sm font-bold text-accent">
                  [03] FAIR_PRICING
                </div>
                <p className="text-xs text-muted-foreground">
                  Set reasonable royalties (2-10%) to earn from resales while
                  keeping tickets attractive to buyers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
