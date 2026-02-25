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
    const { setPremium } = useSajuStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async () => {
        if (!wallet.connected) return;
        setLoading(true);
        setError(null);
        try {
            await processPayment(connection, wallet);
            setPremium(true);
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
                setPremium(true);
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                            background: "rgba(0,0,0,0.7)", zIndex: 100, backdropFilter: "blur(5px)"
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{
                            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                            width: "90%", maxWidth: 400,
                            background: "#18181b", border: "1px solid rgba(168,85,247,0.3)",
                            borderRadius: 24, padding: 24, zIndex: 101,
                            boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
                        }}
                    >
                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                            <div style={{ fontSize: 40, marginBottom: 10 }}>💎</div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Premium Report</h2>
                            <p style={{ fontSize: 13, color: "#a1a1aa", marginTop: 8, lineHeight: 1.5 }}>
                                Unlock detailed yearly forecasts<br />and 10-year Daewoon analysis.
                            </p>
                        </div>

                        {!wallet.connected ? (
                            <div style={{ display: "flex", justifyContent: "center", paddingBottom: 10 }}>
                                <WalletMultiButton style={{ background: "#9333ea" }} />
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    style={{
                                        background: "linear-gradient(135deg, #a855f7, #ec4899)",
                                        border: "none", borderRadius: 14, padding: "14px",
                                        color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? "Processing..." : `Pay ${PREMIUM_COST_SOL} SOL to Unlock`}
                                </button>

                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                                    <span style={{ fontSize: 11, color: "#52525b" }}>OR</span>
                                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                                </div>

                                <button
                                    onClick={handleNftVerify}
                                    disabled={loading}
                                    style={{
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: 14, padding: "14px",
                                        color: "#e4e4e7", fontWeight: 600, fontSize: 14, cursor: "pointer",
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    Verify NFT Holder (Free)
                                </button>
                            </div>
                        )}

                        {error && (
                            <div style={{ marginTop: 16, padding: "10px", background: "rgba(239,68,68,0.1)", borderRadius: 8, color: "#ef4444", fontSize: 12, textAlign: "center" }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginTop: 20, textAlign: "center" }}>
                            <button onClick={onClose} style={{ background: "none", border: "none", color: "#71717a", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
                                No thanks, maybe later
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
