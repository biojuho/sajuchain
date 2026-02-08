
'use client';

import React, { useState } from 'react';
import { Sparkles, Share, Diamond, RotateCcw, Copy, Check, Lock, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionGridProps {
    onRetry: () => void;
    onChat: () => void;
    onShare: () => void;
    onMint: () => void;
}

export const ActionGrid = ({ onRetry, onChat, onShare, onMint }: ActionGridProps) => {
    return (
        <section className="mx-5 mb-8 grid grid-cols-2 gap-3">
            <button
                onClick={onChat}
                className="h-[80px] bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-center gap-1 hover:bg-purple-500/10 active:scale-98 transition-all text-left"
            >
                <Sparkles className="w-5 h-5 text-purple-400 mb-1" />
                <span className="text-[13px] font-bold text-zinc-50">AI 상담하기</span>
                <span className="text-[11px] text-zinc-500">더 자세히 물어보기</span>
            </button>

            <button
                onClick={onShare}
                className="h-[80px] bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-center gap-1 hover:bg-zinc-800 active:scale-98 transition-all text-left"
            >
                <Share className="w-5 h-5 text-zinc-400 mb-1" />
                <span className="text-[13px] font-bold text-zinc-50">공유하기</span>
                <span className="text-[11px] text-zinc-500">인스타 스토리 업로드</span>
            </button>

            <button
                onClick={onMint}
                className="h-[80px] bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-center gap-1 hover:bg-zinc-800 active:scale-98 transition-all text-left"
            >
                <Diamond className="w-5 h-5 text-blue-400 mb-1" />
                <span className="text-[13px] font-bold text-zinc-50">NFT 소장</span>
                <span className="text-[11px] text-zinc-500">블록체인 영구 기록</span>
            </button>

            <button
                onClick={onRetry}
                className="h-[80px] bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-center gap-1 hover:bg-zinc-800 active:scale-98 transition-all text-left"
            >
                <RotateCcw className="w-5 h-5 text-zinc-400 mb-1" />
                <span className="text-[13px] font-bold text-zinc-50">다시 하기</span>
                <span className="text-[11px] text-zinc-500">다른 사주 입력</span>
            </button>
        </section>
    );
};

export const ReferralSystem = () => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("SAJU-A3K9");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="mx-5 mb-10 bg-zinc-900 border border-white/5 rounded-[20px] p-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-zinc-50 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-purple-400" />
                    친구 초대 보상
                </h3>
                <span className="text-xs text-zinc-500">👥 2명 초대됨</span>
            </div>

            {/* Code */}
            <div className="bg-zinc-800 rounded-2xl p-3 flex justify-between items-center mb-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">My Code</span>
                    <span className="text-base font-bold text-purple-400 tracking-wider">SAJU-A3K9</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="w-10 h-10 bg-zinc-700 rounded-xl flex items-center justify-center hover:bg-zinc-600 transition-colors"
                >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                </button>
            </div>

            {/* Progress */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 w-[40%]" />
            </div>

            {/* Rewards List */}
            <div className="space-y-3">
                <div className="flex items-center gap-3 opacity-100">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[13px] text-zinc-200 font-bold">프리미엄 1회 무료</p>
                        <p className="text-[10px] text-zinc-500">1명 초대 (완료)</p>
                    </div>
                    <button className="px-3 py-1 bg-purple-600 rounded-full text-[10px] font-bold text-white">받기</button>
                </div>

                <div className="flex items-center gap-3 opacity-60 grayscale">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                        <Lock className="w-3 h-3 text-zinc-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[13px] text-zinc-200 font-bold">NFT 민팅 30% 할인</p>
                        <p className="text-[10px] text-zinc-500">3명 초대</p>
                    </div>
                    <span className="text-[10px] text-zinc-500">1명 더</span>
                </div>
            </div>
        </section>
    );
};
