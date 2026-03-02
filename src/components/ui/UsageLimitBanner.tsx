'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FREE_INTERPRET_LIMIT, FREE_CHAT_LIMIT } from '@/lib/usage-limiter';
import { Lock, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { trackLimitHit, trackUpgradeClick } from '@/lib/analytics';

const PaymentModalKRW = dynamic(() => import('@/components/payment/PaymentModalKRW'), { ssr: false });

interface UsageLimitBannerProps {
    type: 'interpret' | 'chat';
    remaining: number;
    compact?: boolean;
    onUpgrade?: (blockedActionKey?: string) => void;
    blockedActionKey?: string;
}

export default function UsageLimitBanner({
    type,
    remaining,
    compact = false,
    onUpgrade,
    blockedActionKey,
}: UsageLimitBannerProps) {
    const [showPayment, setShowPayment] = useState(false);
    const trackedLimitHitRef = useRef(false);
    const limit = type === 'interpret' ? FREE_INTERPRET_LIMIT : FREE_CHAT_LIMIT;
    const isExhausted = remaining <= 0;

    useEffect(() => {
        if (!isExhausted || trackedLimitHitRef.current) {
            return;
        }
        trackLimitHit(type, blockedActionKey);
        trackedLimitHitRef.current = true;
    }, [isExhausted, type, blockedActionKey]);

    if (compact && !isExhausted) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Sparkles className="w-3 h-3" />
                <span>오늘 {remaining}/{limit}회 남음</span>
            </div>
        );
    }

    if (!isExhausted) {
        return null;
    }

    const handleUpgradeClick = () => {
        trackUpgradeClick(type, blockedActionKey);
        if (onUpgrade) {
            onUpgrade(blockedActionKey);
            return;
        }
        setShowPayment(true);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-4 bg-gradient-to-r from-red-900/30 to-purple-900/30 border border-red-500/20 rounded-2xl text-center space-y-3"
            >
                <div className="flex items-center justify-center gap-2 text-red-300">
                    <Lock className="w-4 h-4" />
                    <span className="font-bold text-sm">
                        오늘 무료 {type === 'interpret' ? '사주 분석' : '채팅'} 횟수를 모두 사용했습니다
                    </span>
                </div>
                <p className="text-xs text-white/50">
                    프리미엄으로 업그레이드하면 제한 없이 계속 이용할 수 있습니다.
                </p>
                <button
                    type="button"
                    onClick={handleUpgradeClick}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
                >
                    프리미엄 업그레이드 (월 990원)
                </button>
            </motion.div>
            <PaymentModalKRW
                isOpen={showPayment}
                onClose={() => setShowPayment(false)}
                resumeActionKey={blockedActionKey}
                returnToPath={typeof window !== 'undefined' ? window.location.pathname : '/'}
            />
        </>
    );
}

