'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getRandomMockSaju } from '@/lib/mock/sajuMockData';
import { useSajuStore } from '@/lib/store';
import SajuNFTCard from '@/components/nft/SajuNFTCard';
import SajuResultPreview from '@/components/mint/SajuResultPreview';
import MintButton from '@/components/mint/MintButton';
import PremiumReportButton from '@/components/PremiumReportButton';
import { generateNFTImage } from '@/lib/nft/generateNFTImage';
import { generateMetadata } from '@/lib/nft/metadata';
import { mintOrMock } from '@/lib/solana/mockMint';

import { Meteors } from '@/components/magicui/meteors';

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
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 px-4 pb-20 relative overflow-hidden">
            <Meteors number={20} />
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start relative z-10">

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
                            현재 Devnet 환경에서 동작합니다. 실제 자산이 소모되지 않습니다.
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

                    <div className="w-full max-w-[400px] mt-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
                        {/* Status Overlay for Loading */}
                        {isMinting && mintStatus !== 'success' && (
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-800">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    initial={{ width: "0%" }}
                                    animate={{
                                        width: mintStatus === 'generating' ? "33%" :
                                            mintStatus === 'uploading' ? "66%" : "100%"
                                    }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        )}

                        {mintStatus === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }}
                                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                                >
                                    <span className="text-3xl">🎉</span>
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-2">Destiny Minted!</h3>
                                <p className="text-white/60 text-sm mb-6">당신의 운명이 블록체인에 영원히 기록되었습니다.</p>

                                <div className="space-y-3">
                                    <div className="bg-black/50 rounded-lg p-3 border border-white/10 text-left">
                                        <p className="text-xs text-white/40 mb-1">Transaction Signature</p>
                                        <p className="text-xs text-green-400 font-mono truncate">{mintResult?.txSignature}</p>
                                    </div>
                                    <a
                                        href={`https://explorer.solana.com/tx/${mintResult?.txSignature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-white transition-colors"
                                    >
                                        View on Solana Explorer ↗
                                    </a>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <span>💎</span> Minting Process
                                </h3>

                                {/* Stepper UI */}
                                <div className="space-y-6 mb-8 relative">
                                    <div className="absolute left-3.5 top-2 bottom-2 w-px bg-white/10" />

                                    {[
                                        { id: 'generating', label: 'NFT 이미지 생성', desc: '사주 데이터를 시각화합니다.' },
                                        { id: 'uploading', label: '메타데이터 업로드', desc: 'IPFS/Arweave에 저장합니다.' },
                                        { id: 'minting', label: '블록체인 기록', desc: 'Solana 네트워크에 발행합니다.' }
                                    ].map((step, idx) => {
                                        const isActive = mintStatus === step.id;
                                        const isCompleted =
                                            (mintStatus === 'uploading' && idx === 0) ||
                                            (mintStatus === 'minting' && idx <= 1);

                                        return (
                                            <div key={step.id} className="relative flex items-center gap-4 pl-1">
                                                <div className={`
                                                    w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300
                                                    ${isActive || isCompleted ? 'bg-purple-500 border-purple-500' : 'bg-[#0a0a0a] border-white/20'}
                                                `}>
                                                    {isCompleted ? (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <span className={`text-[10px] ${isActive ? 'text-white' : 'text-white/40'}`}>{idx + 1}</span>
                                                    )}
                                                </div>
                                                <div className={`${isActive ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                                                    <p className="text-sm font-bold text-white">{step.label}</p>
                                                    <p className="text-xs text-white/50">{step.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <MintButton
                                    onMint={handleMint}
                                    isMinting={isMinting}
                                />
                                <div className="mt-4 pt-4 border-t border-white/10 w-full flex justify-center">
                                    <PremiumReportButton />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
