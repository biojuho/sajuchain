
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface CtaButtonNativeProps {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    validationMsg?: string;
}

export const CtaButtonNative = ({ onClick, disabled, loading, validationMsg }: CtaButtonNativeProps) => {
    return (
        <div className="space-y-4 pt-1">
            <motion.button
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                onClick={onClick}
                disabled={disabled || loading}
                className={`w-full h-[54px] rounded-[18px] font-bold text-[16px] flex items-center justify-center gap-2 shadow-lg transition-all relative overflow-hidden group ${!disabled && !loading
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-purple-900/40'
                    : 'bg-purple-500/5 border border-purple-500/10 text-purple-900/40 cursor-not-allowed shadow-none'
                    }`}
            >
                {/* Shimmer effect when active */}
                {!disabled && !loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />
                )}

                {loading ? (
                    <span className="animate-spin text-xl">🔮</span>
                ) : (
                    <>
                        <span>운세 보기</span>
                        {!disabled && <Sparkles className="w-4 h-4 text-purple-200/80" />}
                    </>
                )}
            </motion.button>

            {validationMsg && (
                <div className="text-center text-[12px] text-amber-500/90 font-medium">
                    {validationMsg}
                </div>
            )}
        </div>
    );
};
