'use client';

import { useState } from 'react';
import SajuForm from '@/components/SajuForm';
import FourPillars from '@/components/FourPillars';
import FortuneCard from '@/components/FortuneCard';
import { motion } from 'framer-motion';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSajuStore } from '@/lib/store';
import { SajuData, AIResult } from '@/types';
import { SajuResult } from '@/lib/saju-engine';

export default function Home() {
  const { sajuData, setSajuData, reset } = useSajuStore();

  const handleComplete = (data: { saju: SajuResult; ai: AIResult; basic: { year: number; month: number; day: number; hour: number; minute: number; gender: 'M' | 'F' } }) => {
    // Transform to SajuData format
    const newData: SajuData = {
      birthDate: `${data.basic.year}-${data.basic.month}-${data.basic.day}`,
      birthTime: `${data.basic.hour}:${data.basic.minute}`,
      gender: data.basic.gender,
      fourPillars: {
        yearPillar: data.saju.fourPillars.year,
        monthPillar: data.saju.fourPillars.month,
        dayPillar: data.saju.fourPillars.day,
        hourPillar: data.saju.fourPillars.hour
      },
      dayMaster: data.saju.dayMaster,
      aiResult: data.ai,
      generatedAt: new Date().toISOString()
    };
    setSajuData(newData);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A0E27] to-[#1A0B2E] text-white flex flex-col items-center justify-center p-4 overflow-x-hidden">

      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <h1 className="text-2xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
          SajuChain
        </h1>
        {/* Wallet Connect */}
        <div className="z-20">
          <WalletMultiButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-4xl flex flex-col items-center pt-20 pb-10">

        {!sajuData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center w-full"
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                당신의 운명을<br />온체인에 새기다
              </h2>
              <p className="text-white/60 mb-6">AI와 블록체인이 만난 현대적 사주 명리학</p>

              <a
                href="/mint"
                className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-sm font-medium text-purple-300 hover:text-purple-200"
              >
                <span>💎</span> NFT Minting (Phase 3 Beta)
              </a>
            </div>

            <SajuForm onComplete={handleComplete} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full"
          >
            <button
              onClick={reset}
              className="mb-6 text-sm text-white/50 hover:text-white transition-colors"
            >
              &larr; 다시 입력하기
            </button>

            <FourPillars data={sajuData.fourPillars} />

            <div className="my-8 w-full flex justify-center">
              {sajuData.aiResult && <FortuneCard data={sajuData.aiResult} />}
            </div>

            <div className="mt-8">
              <a
                href="/mint"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:opacity-90 transition-all flex items-center gap-2 text-lg"
              >
                <span>🎲</span> 내 운명 Minting 하러가기
              </a>
            </div>

          </motion.div>
        )}

      </div>
    </main>
  );
}
