import { SajuData } from '@/types';

export default function SajuResultPreview({ result }: { result: SajuData }) {
    if (!result.aiResult) return null;

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📜</span> 사주 분석 결과
            </h3>

            <div className="space-y-4 text-white/80">
                <div>
                    <span className="text-xs text-white/50 uppercase tracking-wider">Personality</span>
                    <p className="mt-1 leading-relaxed">{result.aiResult.personality}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-white/50 uppercase tracking-wider">Career</span>
                        <p className="mt-1 text-sm">{result.aiResult.career}</p>
                    </div>
                    <div>
                        <span className="text-xs text-white/50 uppercase tracking-wider">Relationship</span>
                        <p className="mt-1 text-sm">{result.aiResult.relationship}</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <div>
                        <span className="text-xs text-white/50 block">Lucky Color</span>
                        <span className="text-sm font-bold text-white">{result.aiResult.luckyItems.color}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-white/50 block">Key Keyword</span>
                        <span className="text-sm font-bold text-yellow-400">{result.aiResult.threeLineSummary[0]}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
