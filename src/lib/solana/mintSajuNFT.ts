import { Connection } from "@solana/web3.js";
import {
    Metaplex,
    irysStorage,
    walletAdapterIdentity,
    toMetaplexFile
} from "@metaplex-foundation/js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { SajuNFTMetadata } from "../nft/types";

export async function mintSajuNFT(
    connection: Connection,
    wallet: WalletContextState,
    metadata: SajuNFTMetadata,
    imageDatasUri: string // Data URI from canvas
): Promise<{ mintAddress: string; txSignature: string; metadataUri: string }> {

    // 1. Setup Metaplex
    const metaplex = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet))
        .use(irysStorage({
            address: 'https://devnet.irys.xyz',
            providerUrl: connection.rpcEndpoint,
            timeout: 60000,
        }));

    // 2. Upload Image
    // Convert Data URI to Buffer
    const base64Data = imageDatasUri.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const file = toMetaplexFile(imageBuffer, 'saju-nft.png');

    console.log("Uploading image...");
    const imageUri = await metaplex.storage().upload(file);
    console.log("Image uploaded:", imageUri);

    // 3. Upload Metadata
    const { uri: metadataUri } = await metaplex.nfts().uploadMetadata({
        ...metadata,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attributes: metadata.attributes as any,
        image: imageUri,
        properties: {
            files: [{ uri: imageUri, type: 'image/png' }],
            category: 'image',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            creators: metadata.properties.creators as any[]
        }
    });
    console.log("Metadata uploaded:", metadataUri);

    // 4. Mint NFT
    console.log("Minting NFT...");
    const { nft } = await metaplex.nfts().create({
        uri: metadataUri,
        name: metadata.name,
        sellerFeeBasisPoints: 0, // 0% royalty for now
        symbol: metadata.symbol,
        creators: [
            { address: wallet.publicKey!, share: 100 }
        ]
    });

    return {
        mintAddress: nft.address.toString(),
        txSignature: 'Check Explorer for details', // Metaplex hides the sig inside the task
        metadataUri
    };
}
