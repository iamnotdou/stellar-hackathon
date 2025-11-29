import { NextRequest, NextResponse } from "next/server";
import { pinata, getIpfsUrl } from "@/lib/pinata";
import type { EventMetadata } from "@/app/create/create-event-form";

export const runtime = "nodejs";

// Extended metadata type for NFT standard
interface NFTMetadata extends EventMetadata {
  name: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Check for Pinata JWT
    if (!process.env.PINATA_JWT) {
      return NextResponse.json(
        { error: "Pinata not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();

    if (!body.metadata || !body.name) {
      return NextResponse.json(
        { error: "Missing metadata or name" },
        { status: 400 }
      );
    }

    // Build NFT-compatible metadata
    const nftMetadata: NFTMetadata = {
      name: body.name,
      description: body.metadata.description,
      image: body.metadata.image,
      dateTime: body.metadata.dateTime,
      locationAddress: body.metadata.locationAddress,
      category: body.metadata.category,
      contact: body.metadata.contact,
      secondaryMarketFee: body.metadata.secondaryMarketFee,
      external_url: body.external_url,
      attributes: [
        {
          trait_type: "Category",
          value: body.metadata.category,
        },
        {
          trait_type: "Location",
          value: body.metadata.locationAddress,
        },
        {
          trait_type: "Date",
          value: body.metadata.dateTime,
        },
        {
          trait_type: "Resale Royalty",
          value: `${body.metadata.secondaryMarketFee}%`,
        },
      ],
    };

    // Upload metadata JSON to Pinata (public IPFS network)
    const upload = await pinata.upload.public.json(nftMetadata);

    return NextResponse.json({
      success: true,
      cid: upload.cid,
      url: getIpfsUrl(upload.cid),
    });
  } catch (error) {
    console.error("Metadata upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Metadata upload failed",
      },
      { status: 500 }
    );
  }
}
