'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentModalUSDProps {
    isOpen: boolean;
    onClose: () => void;
    resumeActionKey?: string;
    returnToPath?: string;
}

export default function PaymentModalUSD({
    isOpen,
    onClose,
    resumeActionKey,
    returnToPath,
}: PaymentModalUSDProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (resumeActionKey) params.set('resume', resumeActionKey);
            if (returnToPath) params.set('returnTo', returnToPath);
            
            const response = await fetch('/api/payments/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
                    successUrlParams: params.toString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const { url } = await response.json();
            if (url) {
                window.location.href = url; // Redirect to Stripe Hosted Checkout
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Payment initialization failed. Please try again.');
        } finally {
            setIsLoading(false);
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
                        onClick={!isLoading ? onClose : undefined}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[450px] bg-zinc-900 border border-white/10 text-zinc-100 rounded-3xl p-6 z-[51] shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-3">🔮</div>
                            <h2 className="text-xl font-bold mb-2">Premium Mastery</h2>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Unlock deep relationship dynamics and your exclusive 2026 forecast.<br />
                                <span className="text-purple-400 font-bold mt-1 block">For only $0.99</span>
                            </p>
                        </div>

                        <div className="w-full">
                            <button
                                onClick={handleCheckout}
                                disabled={isLoading}
                                className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Unlock with Stripe'
                                )}
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full mt-4 py-3 rounded-xl text-zinc-500 font-medium hover:bg-zinc-800 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
