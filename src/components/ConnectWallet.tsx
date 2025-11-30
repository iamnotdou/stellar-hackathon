"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Wallet, LogOut, Loader2 } from "lucide-react";

export function ConnectWallet() {
  const { isConnected, publicKey, connect, disconnect, ready, isLoading, error } =
    useAuth();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 5000,
      });
    }
  }, [error]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect();
      toast.success("Wallet connected successfully");
    } catch (err) {
      console.error("Connection error:", err);
      // Error is already set in the provider and will be shown via toast
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Wallet disconnected");
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  // Loading skeleton while initializing
  if (!ready) {
    return (
      <Button disabled variant="outline" size="sm">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  // Connected state
  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          className="hidden md:flex items-center gap-2"
          disabled={isLoading}
        >
          <LogOut className="w-3.5 h-3.5" />
          Disconnect
        </Button>
        <div className="border corner-accents px-3 py-2 rounded hover:bg-muted/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium font-mono text-green-500">
              {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Disconnected state
  return (
    <Button
      onClick={handleConnect}
      className="font-mono"
      size="sm"
      disabled={connecting || isLoading}
    >
      {connecting || isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          Connect
        </>
      )}
    </Button>
  );
}

// Backwards compatibility export
export { ConnectWallet as FreighterConnect };

export default ConnectWallet;

