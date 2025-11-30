"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Import from the correct subpaths
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit-tech/stellar-wallets-kit/modules/utils";
import { Networks } from "@creit-tech/stellar-wallets-kit/types";

interface AuthContextType {
  // Connection state
  isConnected: boolean;
  publicKey: string | null;
  ready: boolean;
  isLoading: boolean;
  error: string | null;

  // Network info (for backwards compatibility)
  network: string | null;
  networkPassphrase: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;

  // Transaction signing
  signTransaction: (
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ) => Promise<{ signedTxXdr: string; signerAddress: string }>;

  signAuthEntry: (
    entryXdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ) => Promise<{ signedAuthEntry: string | null; signerAddress: string }>;
}

const NETWORK_PASSPHRASE = Networks.TESTNET;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize wallet kit
  useEffect(() => {
    const initKit = async () => {
      try {
        // Initialize the kit with default modules (supports all wallets)
        StellarWalletsKit.init({
          modules: defaultModules(),
          network: Networks.TESTNET,
        });

        // Try to restore previous session
        try {
          const { address } = await StellarWalletsKit.getAddress();
          if (address) {
            setPublicKey(address);
            setIsConnected(true);
          }
        } catch {
          // No previous session, that's fine
        }

        setReady(true);
      } catch (err) {
        console.error("Failed to initialize wallet kit:", err);
        setError("Failed to initialize wallet system");
        setReady(true);
      }
    };

    initKit();
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Open the authentication modal - user picks their wallet
      const { address } = await StellarWalletsKit.authModal();

      setPublicKey(address);
      setIsConnected(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await StellarWalletsKit.disconnect();
      setPublicKey(null);
      setIsConnected(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to disconnect";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignTransaction = useCallback(
    async (
      xdr: string,
      opts?: { networkPassphrase?: string; address?: string }
    ): Promise<{ signedTxXdr: string; signerAddress: string }> => {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      try {
        const result = await StellarWalletsKit.signTransaction(xdr, {
          networkPassphrase: opts?.networkPassphrase || NETWORK_PASSPHRASE,
          address: opts?.address || publicKey,
        });

        return {
          signedTxXdr: result.signedTxXdr,
          signerAddress: result.signerAddress || publicKey,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to sign transaction";
        setError(errorMessage);
        throw err;
      }
    },
    [publicKey]
  );

  const handleSignAuthEntry = useCallback(
    async (
      entryXdr: string,
      opts?: { networkPassphrase?: string; address?: string }
    ): Promise<{ signedAuthEntry: string | null; signerAddress: string }> => {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      try {
        const result = await StellarWalletsKit.signAuthEntry(entryXdr, {
          networkPassphrase: opts?.networkPassphrase || NETWORK_PASSPHRASE,
          address: opts?.address || publicKey,
        });

        return {
          signedAuthEntry: result.signedAuthEntry,
          signerAddress: result.signerAddress || publicKey,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to sign auth entry";
        setError(errorMessage);
        throw err;
      }
    },
    [publicKey]
  );

  const value: AuthContextType = {
    isConnected,
    publicKey,
    ready,
    isLoading,
    error,
    network: isConnected ? "TESTNET" : null,
    networkPassphrase: isConnected ? NETWORK_PASSPHRASE : null,
    connect,
    disconnect,
    signTransaction: handleSignTransaction,
    signAuthEntry: handleSignAuthEntry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Primary hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Backwards compatibility alias
export function useFreighter() {
  return useAuth();
}

export default AuthProvider;
