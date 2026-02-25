'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TokenGateProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requiredCollection?: string; // Address of the required NFT collection
}

export function TokenGate({ children, fallback, requiredCollection }: TokenGateProps) {
    const { publicKey } = useWallet();
    const [hasAccess, setHasAccess] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        const checkOwnership = async () => {
            if (!publicKey) {
                setHasAccess(false);
                return;
            }

            setChecking(true);
            try {
                // In a real app, query Solana (e.g. via Helius or Metaplex DAS API)
                // const assets = await searchAssets(publicKey.toString());
                // const hasNft = assets.some(asset => asset.grouping[0]?.group_value === requiredCollection);
                
                // Simulation for now
                console.log(`Checking ownership for ${publicKey.toString()}...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Mock: Always grant access for demo if wallet is connected (or valid logic later)
                // For *demo* purposes, let's assume if they have *minted* something in this session (stored in local state?)
                // Or just Random/True for now to show the UI.
                const mockAccess = true; 
                setHasAccess(mockAccess);

            } catch (error) {
                console.error("Token checking failed:", error);
                setHasAccess(false);
            } finally {
                setChecking(false);
            }
        };

        checkOwnership();
    }, [publicKey, requiredCollection]);

    if (!publicKey) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-2xl border border-white/10 text-center space-y-4">
                <Lock className="w-12 h-12 text-gray-500" />
                <h3 className="text-xl font-bold text-gray-300">지갑 연결 필요</h3>
                <p className="text-gray-400 text-sm">이 콘텐츠를 보려면 Solana 지갑을 연결하세요.</p>
                {/* WalletMultiButton would go here, but it's usually in the header */}
            </div>
        );
    }

    if (checking) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-pulse">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">NFT 보유 여부 확인 중...</p>
            </div>
        );
    }

    if (!hasAccess) {
         return fallback || (
            <div className="flex flex-col items-center justify-center p-8 bg-red-900/10 rounded-2xl border border-red-500/20 text-center space-y-4">
                <Lock className="w-12 h-12 text-red-400" />
                <h3 className="text-xl font-bold text-red-200">접근 권한 없음</h3>
                <p className="text-red-200/70 text-sm">해당 콘텐츠는 &apos;SajuChain Membership NFT&apos; 보유자만 열람할 수 있습니다.</p>
                <Button variant="outline" className="border-red-500/50 text-red-300 hover:bg-red-500/10">
                    NFT 구매하러 가기
                </Button>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
        >
            <div className="absolute -top-3 -right-3">
                <Unlock className="w-6 h-6 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
            </div>
            {children}
        </motion.div>
    );
}
