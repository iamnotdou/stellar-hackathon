"use client";

import { useState, useCallback } from "react";

interface UploadResult {
  success: boolean;
  cid: string;
  url: string;
}

interface UploadError {
  error: string;
}

interface UsePinataUploadReturn {
  uploadFile: (file: File) => Promise<UploadResult>;
  uploadMetadata: (metadata: Record<string, unknown>, name: string) => Promise<UploadResult>;
  isUploading: boolean;
  error: string | null;
  progress: number;
}

export function usePinataUpload(): UsePinataUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress (since fetch doesn't support progress natively)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as UploadError;
        throw new Error(errorData.error || "Upload failed");
      }

      return data as UploadResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
      // Reset progress after a short delay
      setTimeout(() => setProgress(0), 500);
    }
  }, []);

  const uploadMetadata = useCallback(
    async (metadata: Record<string, unknown>, name: string): Promise<UploadResult> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        setProgress(50);

        const response = await fetch("/api/upload/metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ metadata, name }),
        });

        setProgress(100);

        const data = await response.json();

        if (!response.ok) {
          const errorData = data as UploadError;
          throw new Error(errorData.error || "Metadata upload failed");
        }

        return data as UploadResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Metadata upload failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
        setTimeout(() => setProgress(0), 500);
      }
    },
    []
  );

  return {
    uploadFile,
    uploadMetadata,
    isUploading,
    error,
    progress,
  };
}

