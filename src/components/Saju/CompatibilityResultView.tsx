import { CompatibilityResult } from '@/types';
import ShineBorder from '@/components/magicui/shine-border';

export default function CompatibilityResultView({ result }: { result: CompatibilityResult }) {
    if (!result) return null;

    return (
        <ShineBorder
            className="rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden shadow-2xl relative group p-0 border-0 w-full"
            color={["#FF6B6B", "#FF8E53", "#FFC75F"]} // Love/Warm colors
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-transparent to-orange-500/10 opacity-50 pointer-events-none" />

            <div className="p-8 flex flex-col items-center">
                <div className="text-center mb-6">
                    <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Chemistry Score</span>
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-400 mt-2">
                        {result.score}%
                    </h2>
                </div>

                <div className="space-y-4 w-full">
                    {/* Summary Card */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <h3 className="text-lg font-semibold text-white mb-1">{result.dayMasterChemistry}</h3>
                        <p className="text-sm text-white/70 italic">"{result.summary}"</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-black/20 rounded-lg p-3 text-center border border-white/5">
                            <span className="text-[10px] text-white/30 uppercase block mb-1">Spirit Connection</span>
                            <span className="text-xs text-rose-200">{result.details.ganChemistry}</span>
                        </div>
                        <div className="bg-black/20 rounded-lg p-3 text-center border border-white/5">
                            <span className="text-[10px] text-white/30 uppercase block mb-1">Reality Bond</span>
                            <span className="text-xs text-orange-200">{result.details.zhiChemistry}</span>
                        </div>
                    </div>

                    {/* Advice */}
                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-2">Relationship Advice</span>
                        <p className="text-sm text-white/90 leading-relaxed font-medium">
                            {result.advice}
                        </p>
                    </div>
                </div>
            </div>
        </ShineBorder>
    );
}
