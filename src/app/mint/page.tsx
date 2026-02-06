'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getRandomMockSaju } from '@/lib/mock/sajuMockData';
import { useSajuStore } from '@/lib/store';
import SajuNFTCard from '@/components/nft/SajuNFTCard';
import SajuResultPreview from '@/components/mint/SajuResultPreview';
import MintButton from '@/components/mint/MintButton';
import { generateNFTImage } from '@/lib/nft/generateNFTImage';
import { generateMetadata } from '@/lib/nft/metadata';
import { mintOrMock } from '@/lib/solana/mockMint';

export default function MintPage() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const { sajuData } = useSajuStore();
    const router = useRouter();

    // State
    const [isMinting, setIsMinting] = useState(false);
    const [mintStatus, setMintStatus] = useState<string>(''); // 'generating', 'uploading', 'minting', 'success', 'error'
    const [mintResult, setMintResult] = useState<{ mintAddress: string; txSignature: string } | null>(null);

    useEffect(() => {
        // Hydration check or redirection if no data
        if (!sajuData && process.env.NEXT_PUBLIC_MOCK_MINT !== 'true') {
            router.push('/');
        }
    }, [sajuData, router]);

    const displayData = sajuData || (process.env.NEXT_PUBLIC_MOCK_MINT === 'true' ? getRandomMockSaju() : null);

    const handleMint = async () => {
        const isMock = process.env.NEXT_PUBLIC_MOCK_MINT === 'true';
        if (!displayData) return;
        if (!wallet.publicKey && !isMock) return;

        try {
            setIsMinting(true);
            setMintStatus('generating'); // Step 1: Image Gen

            // 1. Generate Image
            const imageUri = await generateNFTImage(displayData);

            setMintStatus('uploading'); // Step 2: Meta Upload

            // 2. Prepare Metadata
            // We use a temp mint address placeholder since we don't have it yet
            const metadata = generateMetadata(displayData, imageUri, "PENDING");

            setMintStatus('minting'); // Step 3: Blockchain Transaction

            // 3. Mint Logic
            const result = await mintOrMock(connection, wallet, metadata, imageUri);

            setMintResult(result);
            setMintStatus('success');

        } catch (error) {
            console.error("Minting failed:", error);
            setMintStatus('error');
            alert("Minting failed! See console for details.");
        } finally {
            setIsMinting(false);
        }
    };

    if (!displayData) return <div className="text-white text-center py-20">운세 데이터를 불러오는 중입니다...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 px-4 pb-20">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">

                {/* Left Column: Result & Info */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                            Mint Your Destiny
                        </h1>
                        <p className="text-gray-400 leading-relaxed">
                            당신의 사주팔자를 블록체인에 영원히 기록하세요.<br />
                            생성된 NFT는 당신만의 고유한 운명의 증표가 됩니다.
                        </p>
                    </div>

                    <SajuResultPreview result={displayData} />

                    <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-lg">
                        <h4 className="text-yellow-500 font-bold mb-2 flex items-center gap-2">
                            <span>⚠️</span> Notice
                        </h4>
                        <p className="text-sm text-yellow-200/60">
                            현재 Devnet 환경에서 동작합니다. 실제 자산이 소모되지 않습니다.<br />
                            (Mock Mode: {process.env.NEXT_PUBLIC_MOCK_MINT === 'true' ? 'ON' : 'OFF'})
                        </p>
                    </div>
                </div>

                {/* Right Column: NFT Preview & Action */}
                <div className="flex flex-col items-center sticky top-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                        <SajuNFTCard data={displayData} className="relative transform transition-transform hover:scale-[1.02]" />
                    </motion.div>

                    <div className="w-full max-w-[400px] mt-8 space-y-4">
                        {mintStatus === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-900/20 border border-green-500/30 p-6 rounded-xl text-center"
                            >
                                <div className="text-4xl mb-2">🎉</div>
                                <h3 className="text-xl font-bold text-green-400 mb-2">Minting Successful!</h3>
                                <div className="space-y-2 text-sm text-left bg-black/30 p-3 rounded overflow-hidden">
                                    <p className="truncate"><span className="text-gray-500">Address:</span> {mintResult?.mintAddress}</p>
                                    <a
                                        href={`https://explorer.solana.com/tx/${mintResult?.txSignature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 underline block mt-2 text-center"
                                    >
                                        View on Explorer
                                    </a>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                {/* Progress Stepper */}
                                {mintStatus && mintStatus !== 'error' && (
                                    <div className="flex justify-between text-xs text-gray-500 mb-2 px-2">
                                        <span className={mintStatus === 'generating' ? 'text-purple-400 font-bold' : ''}>1. Generate</span>
                                        <span className={mintStatus === 'uploading' ? 'text-purple-400 font-bold' : ''}>2. Upload</span>
                                        <span className={mintStatus === 'minting' ? 'text-purple-400 font-bold' : ''}>3. Mint</span>
                                    </div>
                                )}

                                <MintButton
                                    onMint={handleMint}
                                    isMinting={isMinting}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
