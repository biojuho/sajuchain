import type { Connection } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import type { SajuNFTMetadata } from "../nft/types";

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function mintSajuNFT(
    connection: Connection,
    wallet: WalletContextState,
    metadata: SajuNFTMetadata,
    imageDatasUri: string
): Promise<{ mintAddress: string; txSignature: string; metadataUri: string }> {
/* eslint-enable @typescript-eslint/no-unused-vars */
    console.warn("NFT Minting is temporarily disabled in Phase 8 (Fiat Pivot).");

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Throw error to inform user
    throw new Error("Minting is currently under maintenance. Please try again later (Phase 8 Update).");

    /* 
    // ORIGINAL CODE PRESERVED FOR REFERENCE
    // ... Metaplex logic ...
    */
}
