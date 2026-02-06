import { Connection } from "@solana/web3.js";
import { SajuNFTMetadata } from "../nft/types";
import { mintSajuNFT } from "./mintSajuNFT";

// Environment Check
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MINT === 'true';

export async function mintOrMock(
    connection: Connection,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wallet: any,
    metadata: SajuNFTMetadata,
    imageUri: string
) {
    if (MOCK_MODE) {
        console.log("🚀 MOCK MINTING MODE ACTIVATED");
        console.log("Metadata:", metadata);

        // Simulate Network Delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        return {
            mintAddress: "MockMint" + Math.random().toString(36).substring(7).toUpperCase(),
            txSignature: "MockTxSignature_" + Date.now(),
            metadataUri: "https://mock.arweave.net/metadata.json"
        };
    }

    // Call Real Function
    return mintSajuNFT(connection, wallet, metadata, imageUri);
}
