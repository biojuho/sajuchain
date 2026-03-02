import { CompatibilityResult } from '@/types';
import ShineBorder from '@/components/magicui/shine-border';

export default function CompatibilityResultView({ result }: { result: CompatibilityResult }) {
    if (!result) return null;

    return (
        <ShineBorder
            className="rounded-2xl bg-zinc-900/50 overflow-hidden shadow-2xl relative group p-0 border border-white/10 w-full"
            color={["#F472B6", "#A78BFA", "#60A5FA"]} // Pink, Purple, Blue
        >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="p-8 flex flex-col items-center relative z-10">
                {/* Score Section */}
                <div className="text-center mb-8 relative">
                    <div className="absolute inset-0 bg-pink-500/20 blur-[50px] rounded-full" />
                    <span className="text-xs font-mono text-pink-300 uppercase tracking-[0.2em] relative z-10">Chemistry Score</span>
                    <h2 className="text-6xl font-black text-white mt-2 relative z-10 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                        {result.score}
                        <span className="text-2xl text-pink-400 font-normal">%</span>
                    </h2>
                </div>

                <div className="space-y-4 w-full">
                    {/* Summary Card */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-purple-200 mb-2">
                             {result.dayMasterChemistry}
                        </h3>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            &quot;{result.summary}&quot;
                        </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/20 rounded-xl p-4 text-center border border-white/5 flex flex-col items-center justify-center gap-2">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Mental Connection</span>
                            <span className="text-sm font-bold text-pink-200">{result.details.ganChemistry}</span>
                        </div>
                        <div className="bg-black/20 rounded-xl p-4 text-center border border-white/5 flex flex-col items-center justify-center gap-2">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Physical Bond</span>
                            <span className="text-sm font-bold text-purple-200">{result.details.zhiChemistry}</span>
                        </div>
                    </div>

                    {/* Advice Section */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                         <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 text-center">
                            Oracle&apos;s Advice
                        </h4>
                        <div className="bg-purple-900/10 border border-purple-500/10 rounded-xl p-4">
                            <p className="text-sm text-zinc-300 leading-7 font-medium text-justify">
                                {result.advice}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ShineBorder>
    );
}
