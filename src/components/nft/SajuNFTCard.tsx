'use client';

import { SajuData } from '@/types';

const ELEMENT_COLORS: Record<string, string> = {
    '목(木)': 'from-green-900 to-green-600',
    '화(火)': 'from-red-900 to-red-600',
    '토(土)': 'from-yellow-900 to-yellow-600',
    '금(金)': 'from-gray-800 to-gray-400',
    '수(水)': 'from-blue-900 to-blue-600',
};

export default function SajuNFTCard({ data, className }: { data: SajuData, className?: string }) {
    const dominantColor = data.fiveElements
        ? (ELEMENT_COLORS[data.fiveElements.dominant] || 'from-purple-900 to-indigo-900')
        : 'from-purple-900 to-indigo-900';

    return (
        <div className={`relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-xl overflow-hidden shadow-2xl ${className}`}>
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${dominantColor} opacity-80`} />

            {/* Noise/Texture Overlay */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

            {/* Content Container */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between border-4 border-white/10 rounded-xl relative z-10">

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-xs text-white/60 tracking-[0.2em] font-bold">SAJUCHAIN</span>
                        <span className="text-2xl text-white font-serif font-bold tracking-widest mt-1">
                            {data.fourPillars.year?.heavenlyStem || '?'}{data.fourPillars.year?.earthlyBranch || '?'}
                        </span>
                    </div>
                    <div className="px-2 py-1 bg-black/30 rounded border border-white/20 backdrop-blur-sm">
                        <span className="text-[10px] text-white/80">#GENESIS</span>
                    </div>
                </div>

                {/* Main Pillars Visual */}
                <div className="flex justify-center gap-4 md:gap-6 my-4">
                    {[data.fourPillars.year, data.fourPillars.month, data.fourPillars.day, data.fourPillars.hour].map((pillar, idx) => (
                        pillar ? (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/20 border border-white/20 flex items-center justify-center backdrop-blur-md">
                                    <span className="text-lg md:text-xl text-white font-serif">{pillar.heavenlyStem}</span>
                                </div>
                                <div className="w-1 h-8 md:h-12 w-px bg-white/20" />
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md rotate-45">
                                    <span className="text-lg md:text-xl text-white font-serif -rotate-45">{pillar.earthlyBranch}</span>
                                </div>
                            </div>
                        ) : null
                    ))}
                </div>

                {/* Footer Info */}
                <div className="flex justify-between items-end bg-black/20 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/50 uppercase">Dominant</span>
                        <span className="text-sm text-white font-bold">{data.fiveElements?.dominant || 'Unknown'}</span>
                    </div>

                    <div className="h-full w-px bg-white/20 mx-2" />

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/50 uppercase">Lucky</span>
                        <div className="flex items-center gap-1">
                            {data.aiResult?.luckyItems ? (
                                <>
                                    <div
                                        className="w-3 h-3 rounded-full border border-white/30 shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                                        style={{ backgroundColor: data.aiResult.luckyItems.color.toLowerCase() }}
                                    />
                                    <span className="text-sm text-white font-bold">{data.aiResult.luckyItems.number}</span>
                                </>
                            ) : (
                                <span className="text-xs text-white/50">-</span>
                            )}
                        </div>
                    </div>

                    <div className="ml-auto">
                        <span className="text-2xl">🐉</span>
                    </div>
                </div>

                {/* Holographic Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/5 rounded-full blur-xl pointer-events-none" />
            </div>
        </div>
    );
}
