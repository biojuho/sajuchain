import { SajuData } from '@/types';
import ShineBorder from '@/components/magicui/shine-border';
import FiveElementsChart from '@/components/saju/FiveElementsChart';

export default function SajuResultPreview({ result }: { result: SajuData }) {
    if (!result.fourPillars) return null;

    const { fourPillars, dayMaster, sajuInterpretation } = result;

    return (
        <ShineBorder
            className="rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden shadow-2xl relative group p-0 border-0 w-full"
            color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        >
            {/* Holographic Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-purple-500/10 opacity-50 pointer-events-none group-hover:opacity-75 transition-opacity z-0" />

            {/* Header */}
            <div className="bg-black/20 p-4 border-b border-white/5 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        SC
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">SajuChain Identity</h3>
                        <p className="text-[10px] text-white/40 font-mono">Soulbound Destiny Protocol</p>
                    </div>
                </div>
                <div className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] font-mono text-purple-300">
                    VERIFIED v2.0
                </div>
            </div>

            <div className="p-6 relative z-10 space-y-6">

                {/* Saju Pillars Grid */}
                {/* Saju Pillars Grid */}
                <div className="grid grid-cols-2 gap-2 text-center bg-white/5 p-4 rounded-xl border border-white/5">
                    {/* Headers removed for unified mobile look, using inline labels */}

                    {/* Pillars Data */}
                    {[fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour].map((pillar, i) => (
                        pillar ? (
                            <div key={i} className="flex flex-col items-center gap-1 p-2 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                <span className="text-[10px] text-white/30 uppercase mb-1">{['Year', 'Month', 'Day', 'Hour'][i]}</span>

                                {/* Ten God (Heavenly Stem) */}
                                <span className="text-[10px] text-purple-200/70">{pillar.tenGod?.split('/')[0] || '-'}</span>

                                {/* Heavenly Stem */}
                                <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/10 text-lg font-serif text-white">
                                    {pillar.heavenlyStem}
                                </div>

                                {/* Earthly Branch */}
                                <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/10 text-lg font-serif text-white">
                                    {pillar.earthlyBranch}
                                </div>

                                {/* Ten God (Earthly Branch) */}
                                <span className="text-[10px] text-purple-200/70">{pillar.tenGod?.split('/')[1] || '-'}</span>

                                {/* 12 Unseong */}
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5 mt-1">
                                    {pillar.unseong || '-'}
                                </span>
                            </div>
                        ) : null
                    ))}
                </div>



                {/* Daewoon (10-Year Luck Cycles) */}
                {result.daewoon && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">10-Year Luck Cycles (Daewoon)</span>
                            <span className="text-[9px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                Start Age: {result.daewoon.startAge}
                            </span>
                        </div>

                        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {result.daewoon.cycles.map((cycle, i) => {
                                const currentYear = new Date().getFullYear();
                                const birthYear = parseInt(result.birthDate.substring(0, 4));
                                const currentAge = currentYear - birthYear + 1; // Korean Age approx
                                const isCurrent = currentAge >= cycle.startAge && currentAge < cycle.endAge;

                                return (
                                    <div
                                        key={i}
                                        className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg border min-w-[60px] transition-all ${isCurrent
                                            ? 'bg-purple-600/20 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                            : 'bg-black/20 border-white/5 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <span className={`text-[9px] mb-1 ${isCurrent ? 'text-purple-200 font-bold' : 'text-white/30'}`}>
                                            {cycle.startAge}~{cycle.endAge - 1}
                                        </span>
                                        <div className="flex flex-col items-center gap-0.5 my-1">
                                            <span className="text-sm font-serif text-white">{cycle.ganZhi.charAt(0)}</span>
                                            <span className="text-sm font-serif text-white">{cycle.ganZhi.charAt(1)}</span>
                                        </div>
                                        <span className="text-[8px] text-white/40 mt-1">{cycle.tenGod.split('/')[0]}</span>
                                        {isCurrent && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 animate-pulse" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* AI Daewoon Analysis */}
                {result.aiResult?.daewoonAnalysis && (
                    <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            <span className="text-[10px] text-purple-300 uppercase tracking-wider">AI Life Flow Analysis</span>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed">
                            {result.aiResult.daewoonAnalysis}
                        </p>
                    </div>
                )}

                {/* Five Elements Chart */}
                {result.fiveElements && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider mb-2 w-full text-left">Elemental Balance</span>
                        <FiveElementsChart data={result.fiveElements} />
                    </div>
                )}

                {/* Interpretation */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider block">Day Master Analysis</span>
                        <span className="text-sm font-bold text-purple-300">
                            {typeof dayMaster === 'string' ? dayMaster : dayMaster?.hanja || dayMaster?.name || 'Unknown'}
                        </span>
                    </div>

                    {sajuInterpretation && (
                        <p className="text-xs text-white/80 leading-relaxed mb-3">
                            {sajuInterpretation.dominanceMsg}
                        </p>
                    )}

                    {sajuInterpretation?.personalityKeywords && (
                        <div className="flex flex-wrap gap-1.5">
                            {sajuInterpretation.personalityKeywords.map((k, i) => (
                                <span key={i} className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[10px] text-purple-200">
                                    #{k}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Core Traits (AI Result - Existing) */}
                {result.aiResult && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50 uppercase tracking-wider">Soul Signature</span>
                            <div className="h-px flex-1 bg-white/10 mx-4" />
                        </div>
                        <p className="text-sm leading-relaxed text-white/80 italic">
                            &quot;{result.aiResult.personality.slice(0, 80)}...&quot;
                        </p>
                    </div>
                )}

                {/* Footer Metadata */}
                <div className="pt-4 border-t border-white/10 flex justify-between items-end opacity-50 hover:opacity-100 transition-opacity">
                    <div className="font-mono text-[9px] text-white/30 space-y-1">
                        <p>ID: {result.uniqueHash || 'PENDING-MINT'}</p>
                        <p>TS: {result.generatedAt}</p>
                    </div>
                </div>
            </div>
        </ShineBorder >
    );
}
