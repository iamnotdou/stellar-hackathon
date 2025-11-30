import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, networks } from "../../sticket-contracts/packages/sticket-factory/src/index";
import { Buffer } from "buffer";

const RPC_URL = "https://soroban-testnet.stellar.org";

// XLM native token on testnet (SAC - Stellar Asset Contract)
const XLM_TOKEN_ADDRESS =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

// Convert XLM to stroops (1 XLM = 10,000,000 stroops)
const XLM_TO_STROOPS = BigInt(10_000_000);

export interface CreateEventParams {
  name: string;
  symbol?: string;
  eventCreator: string;
  totalSupply: number;
  primaryPrice: number; // In XLM
  creatorFeeBps: number;
  eventMetadata: string; // IPFS URL
  paymentToken?: string;
}

export interface CreateEventResult {
  eventContract: string;
  txHash?: string;
}

interface SignTransactionResult {
  signedTxXdr: string;
  signerAddress?: string;
}

function generateRandomSalt(): Buffer {
  const salt = Buffer.alloc(32);
  if (typeof window !== "undefined" && window.crypto) {
    const randomBytes = new Uint8Array(32);
    window.crypto.getRandomValues(randomBytes);
    for (let i = 0; i < 32; i++) {
      salt[i] = randomBytes[i];
    }
  } else {
    for (let i = 0; i < 32; i++) {
      salt[i] = Math.floor(Math.random() * 256);
    }
  }
  return salt;
}

function generateSymbol(name: string): string {
  // Create a symbol from name: take first letters of words, max 8 chars
  const words = name.toUpperCase().split(/\s+/);
  let symbol = words.map((w) => w[0]).join("");
  if (symbol.length < 3) {
    symbol = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
  }
  return symbol.slice(0, 8) || "TICKET";
}

async function createEvent(
  params: CreateEventParams,
  signTransaction: (
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ) => Promise<SignTransactionResult>
): Promise<CreateEventResult> {
  const client = new Client({
    contractId: networks.testnet.contractId,
    networkPassphrase: networks.testnet.networkPassphrase,
    rpcUrl: RPC_URL,
    publicKey: params.eventCreator,
    signTransaction: async (xdr: string) => {
      const result = await signTransaction(xdr, {
        networkPassphrase: networks.testnet.networkPassphrase,
        address: params.eventCreator,
      });
      return result;
    },
  });

  const salt = generateRandomSalt();
  const symbol = params.symbol || generateSymbol(params.name);
  const priceInStroops = BigInt(
    Math.floor(params.primaryPrice * Number(XLM_TO_STROOPS))
  );

  const tx = await client.create_event({
    salt,
    event_creator: params.eventCreator,
    total_supply: params.totalSupply,
    primary_price: priceInStroops,
    creator_fee_bps: params.creatorFeeBps,
    event_metadata: params.eventMetadata,
    name: params.name,
    symbol,
    payment_token: params.paymentToken || XLM_TOKEN_ADDRESS,
  });

  // Sign and send the transaction
  const result = await tx.signAndSend();

  if (result.result === undefined) {
    throw new Error("Transaction failed - no result returned");
  }

  return {
    eventContract: result.result as string,
    txHash:
      result.sendTransactionResponse && "hash" in result.sendTransactionResponse
        ? result.sendTransactionResponse.hash
        : undefined,
  };
}

export function useCreateEvent(
  signTransaction: (
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ) => Promise<SignTransactionResult>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateEventParams) =>
      createEvent(params, signTransaction),
    onSuccess: () => {
      // Invalidate and refetch all events
      queryClient.invalidateQueries({
        queryKey: ["sticket-factory", "all-events"],
      });
    },
  });
}

export { XLM_TOKEN_ADDRESS, XLM_TO_STROOPS };
