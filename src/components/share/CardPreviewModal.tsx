
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2, MessageCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import ShareCard, { ShareTheme } from './ShareCard';
import ThemeSelector from './ThemeSelector';
import { SajuData, CompatibilityResult } from '@/types';
import { sendKakaoShare } from '@/lib/kakaoShare';
import { trackShare } from '@/lib/analytics';

interface CardPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: SajuData | CompatibilityResult;
    type: 'saju' | 'compatibility';
}

export default function CardPreviewModal({ isOpen, onClose, data, type }: CardPreviewModalProps) {
    const [theme, setTheme] = useState<ShareTheme>('mystic');
    const [isGenerating, setIsGenerating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!cardRef.current) return;

        try {
            setIsGenerating(true);

            // Wait a bit for fonts/images to be fully ready if needed
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(cardRef.current, {
                scale: 1, // 1:1 scale since the card is already 1080x1920
                useCORS: true,
                backgroundColor: null,
            });

            const image = canvas.toDataURL("image/png");

            // Trigger Download
            const link = document.createElement('a');
            link.href = image;
            link.download = `saju_card_${Date.now()}.png`;
            link.click();
            trackShare('download');

            // Web Share API (Mobile)
            if (navigator.share) {
                const blob = await (await fetch(image)).blob();
                const file = new File([blob], `saju_card.png`, { type: 'image/png' });
                try {
                    await navigator.share({
                        files: [file],
                        title: 'SajuChain Result',
                        text: 'Check out my SajuChain destiny!',
                    });
                } catch (err) {
                    console.log('Share canceled or failed', err);
                }
            }

        } catch (err) {
            console.error('Failed to generate image', err);
            alert('Failed to generate image. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKakaoShare = () => {
        const isSaju = type === 'saju';
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sajuchain.com';

        let title: string;
        let description: string;

        if (isSaju) {
            const sajuData = data as SajuData;
            const dayMaster = typeof sajuData.dayMaster === 'string'
                ? sajuData.dayMaster
                : sajuData.dayMaster?.hanja || '';
            title = dayMaster ? `나의 사주: ${dayMaster} 일간` : '나의 사주 운명';
            description = sajuData.aiResult?.headline || 'SajuChain에서 나의 운명을 확인해보세요!';
        } else {
            const compData = data as CompatibilityResult;
            title = `궁합 점수: ${compData.score}점`;
            description = compData.summary || '우리의 궁합을 확인해보세요!';
        }

        sendKakaoShare({
            title,
            description,
            imageUrl: `${baseUrl}/api/og`,
            webUrl: baseUrl,
            buttonTitle: '나도 운세 보기',
        });
        trackShare('kakao');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    className="w-full max-w-md bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 flex justify-between items-center border-b border-white/10 bg-black/20">
                        <h3 className="text-white font-bold text-lg">Share Result</h3>
                        <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-dots-pattern relative flex justify-center items-center">
                        { }
                        <div className="relative shadow-2xl rounded-2xl overflow-hidden ring-4 ring-white/10 mx-auto" style={{ width: 270, height: 480 }}>
                            {/* Live Preview (Scaled Down) */}
                            {/* We render a scaled copy here for preview, OR we use scale transform on the same component if logic allows.
                                 However, html2canvas works best on unscaled elements. 
                                 Strategy: Render the REAL card hidden (offscreen) for capture, and render a SCALED CSS transformed card for preview. 
                              */}
                            <div className="origin-top-left transform scale-[0.25]">
                                <ShareCard
                                    data={data}
                                    type={type}
                                    theme={theme}
                                // No ref here, this is just visual preview
                                />
                            </div>

                            {/* Loading Overlay */}
                            {isGenerating && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white/80">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <span className="text-xs">Generating...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="p-6 bg-[#111] border-t border-white/10 space-y-6">
                        {/* Theme Selector */}
                        <div className="space-y-2">
                            <label className="text-xs text-white/40 uppercase tracking-wider font-bold ml-1">Select Theme</label>
                            <ThemeSelector currentTheme={theme} onSelect={setTheme} />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleDownload}
                                disabled={isGenerating}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Save & Share
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleKakaoShare}
                                className="w-full py-4 bg-[#FEE500] rounded-xl font-bold text-[#3C1E1E] flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <MessageCircle className="w-5 h-5" />
                                카카오톡 공유
                            </button>
                        </div>
                    </div>
                </div>

                {/* HIDDEN CAPTURE TARGET */}
                {/* This is positioned off-screen but rendered at full size (1080x1920) for html2canvas */}
                { }
                <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                    <ShareCard
                        ref={cardRef}
                        data={data}
                        type={type}
                        theme={theme}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
