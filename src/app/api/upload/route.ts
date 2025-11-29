import { NextRequest, NextResponse } from "next/server";
import { pinata, getIpfsUrl } from "@/lib/pinata";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Check for Pinata JWT
    if (!process.env.PINATA_JWT) {
      return NextResponse.json(
        { error: "Pinata not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Upload to Pinata (public IPFS network)
    const upload = await pinata.upload.public.file(file);

    // Return the CID and gateway URL
    return NextResponse.json({
      success: true,
      cid: upload.cid,
      url: getIpfsUrl(upload.cid),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

