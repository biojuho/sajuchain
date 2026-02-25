
import React, { forwardRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { SajuData, CompatibilityResult } from '@/types';
import QRCode from 'qrcode';

export type ShareTheme = 'mystic' | 'blossom' | 'gold';

interface ShareCardProps {
    data: SajuData | CompatibilityResult;
    type: 'saju' | 'compatibility';
    theme: ShareTheme;
}

export const THEMES: Record<ShareTheme, { bg: string; text: string; accent: string; decor: string }> = {
    mystic: {
        bg: 'bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f1a]',
        text: 'text-purple-100',
        accent: 'text-purple-400',
        decor: '✨ 🌙 ✨'
    },
    blossom: {
        bg: 'bg-gradient-to-b from-[#fff0f5] via-[#ffe4e1] to-[#ffd1dc]',
        text: 'text-pink-900',
        accent: 'text-pink-600',
        decor: '🌸 🌺 🌸'
    },
    gold: {
        bg: 'bg-gradient-to-b from-[#000000] via-[#1a1a1a] to-[#332b00]',
        text: 'text-yellow-100',
        accent: 'text-yellow-500',
        decor: '🐉 💠 🐉'
    }
};

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ data, type, theme }, ref) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const style = THEMES[theme];

    useEffect(() => {
        // Generate QR Code
        // In a real app, this would be a URL with referral code
        QRCode.toDataURL('https://sajuchain.com')
            .then((url: string) => setQrCodeUrl(url))
            .catch((err: unknown) => console.error(err));
    }, []);

    const isSaju = type === 'saju';
    const sajuData = data as SajuData;
    const compData = data as CompatibilityResult;

    return (
        <div
            ref={ref}
            className={`w-[1080px] h-[1920px] ${style.bg} flex flex-col items-center justify-between p-24 text-center font-sans relative overflow-hidden`}
        >
            {/* Background Decor */}
            <div className="absolute inset-0 opacity-10 pointer-events-none text-[20rem] flex items-center justify-center">
                {style.decor}
            </div>

            {/* Header */}
            <header className="z-10 space-y-4">
                <h1 className={`text-6xl font-bold tracking-[0.5em] uppercase ${style.accent}`}>SajuChain</h1>
                <p className={`text-3xl opacity-60 ${style.text}`}>Digital Destiny Protocol</p>
            </header>

            {/* Main Content */}
            <main className="z-10 flex-1 flex flex-col justify-center items-center w-full space-y-16">

                {isSaju ? (
                    <>
                        {/* Element & Day Master */}
                        <div className="space-y-6">
                            <span className={`text-4xl px-6 py-2 rounded-full border border-current opacity-60 ${style.text}`}>
                                {sajuData.fiveElements?.dominant || 'Dominant'}
                            </span>
                            <div className={`text-[12rem] font-serif font-bold ${style.accent} leading-none`}>
                                {typeof sajuData.dayMaster === 'string' ? sajuData.dayMaster : sajuData.dayMaster?.hanja}
                            </div>
                            <div className={`text-5xl font-bold opacity-80 ${style.text}`}>
                                {sajuData.fourPillars.day.tenGod?.split('/')[0] || 'Day Master'}
                            </div>
                        </div>

                        {/* Keywords */}
                        <div className="flex flex-wrap justify-center gap-4 max-w-[800px]">
                            {sajuData.aiResult?.threeLineSummary?.map((keyword, i) => (
                                <span key={i} className={`text-4xl px-8 py-4 rounded-2xl bg-white/10 ${style.text} backdrop-blur-md`}>
                                    #{keyword}
                                </span>
                            ))}
                        </div>

                        {/* Summary */}
                        <p className={`text-4xl leading-relaxed max-w-[800px] ${style.text} opacity-90`}>
                            &quot;{sajuData.aiResult?.headline || 'Your destiny is written in the stars.'}&quot;
                        </p>
                    </>
                ) : (
                    <>
                        {/* Compatibility Score */}
                        <div className="space-y-4">
                            <div className={`text-[15rem] font-bold ${style.accent} leading-none drop-shadow-2xl`}>
                                {compData.score}
                            </div>

                        </div>

                        <div className="flex items-center gap-12 text-6xl opacity-80">
                            <span>{compData.sajuA.name || 'Partner A'}</span>
                            <span className="text-4xl opacity-50">&</span>
                            <span>{compData.sajuB.name || 'Partner B'}</span>
                        </div>

                        {/* Comment */}
                        <p className={`text-5xl leading-relaxed max-w-[800px] font-bold ${style.text} mt-12`}>
                            &quot;{compData.score >= 80 ? 'Perfect Harmony' : compData.score >= 60 ? 'Good Balance' : 'Needs Effort'}&quot;
                        </p>
                    </>
                )}

            </main>

            {/* Footer */}
            <footer className="z-10 flex flex-col items-center gap-8 bg-white/5 p-12 rounded-3xl backdrop-blur-sm w-full max-w-[800px] border border-white/10">
                <div className="flex items-center gap-12">
                    {qrCodeUrl && (
                        <Image src={qrCodeUrl} alt="QR Code" width={192} height={192} className="w-48 h-48 rounded-xl" />
                    )}
                    <div className="text-left space-y-2">
                        <p className={`text-4xl font-bold ${style.accent}`}>Discover Your Destiny</p>
                        <p className={`text-2xl opacity-70 ${style.text}`}>Scan to view details</p>
                    </div>
                </div>
                <div className={`text-2xl opacity-40 ${style.text}`}>
                    sajuchain.com | @sajuchain
                </div>
            </footer>
        </div>
    );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
