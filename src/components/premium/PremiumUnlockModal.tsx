'use client';
 

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
    { ssr: false }
);
import { processPayment, validateOwnership, PREMIUM_COST_SOL } from '@/lib/solana/payment';
import { useSajuStore } from '@/lib/store';

interface PremiumUnlockModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PremiumUnlockModal({ isOpen, onClose }: PremiumUnlockModalProps) {
    const { connection } = useConnection();
    const wallet = useWallet();
    const { refreshEntitlement } = useSajuStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async () => {
        if (!wallet.connected) return;
        setLoading(true);
        setError(null);
        try {
            await processPayment(connection, wallet);
            await refreshEntitlement();
            onClose();
            alert("Premium Unlocked! (Payment Verified)");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    const handleNftVerify = async () => {
        if (!wallet.connected) return;
        setLoading(true);
        setError(null);
        try {
            const hasNft = await validateOwnership(connection, wallet);
            if (hasNft) {
                await refreshEntitlement();
                onClose();
                alert("Verified Holder! Premium Unlocked.");
            } else {
                setError("No Saju NFT found in wallet.");
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
                    />
                    <motion.div
                        key="modal-content"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-zinc-900 border border-purple-500/30 rounded-3xl p-6 z-[101] shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                    >
                        <div className="text-center mb-5">
                            <div className="text-4xl mb-2.5">💎</div>
                            <h2 className="text-xl font-bold m-0">Premium Report</h2>
                            <p className="text-[13px] text-zinc-400 mt-2 leading-relaxed">
                                Unlock detailed yearly forecasts<br />and 10-year Daewoon analysis.
                            </p>
                        </div>

                        {!wallet.connected ? (
                            <div className="flex justify-center pb-2.5">
                                <WalletMultiButton className="!bg-purple-600" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className={`bg-gradient-to-br from-purple-500 to-pink-500 border-none rounded-2xl p-3.5 text-white font-bold text-[15px] cursor-pointer ${loading ? 'opacity-70' : 'opacity-100'}`}
                                >
                                    {loading ? "Processing..." : `Pay ${PREMIUM_COST_SOL} SOL to Unlock`}
                                </button>

                                <div className="flex items-center gap-2.5">
                                    <div className="flex-1 h-px bg-white/10" />
                                    <span className="text-[11px] text-zinc-600">OR</span>
                                    <div className="flex-1 h-px bg-white/10" />
                                </div>

                                <button
                                    onClick={handleNftVerify}
                                    disabled={loading}
                                    className={`bg-white/5 border border-white/10 rounded-2xl p-3.5 text-zinc-200 font-semibold text-sm cursor-pointer ${loading ? 'opacity-70' : 'opacity-100'}`}
                                >
                                    Verify NFT Holder (Free)
                                </button>
                            </div>
                        )}

                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 overflow-hidden"
                                >
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-[13px] text-center">
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-5 text-center">
                            <button onClick={onClose} className="bg-transparent border-none text-zinc-500 text-xs cursor-pointer underline">
                                No thanks, maybe later
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
