'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import SajuFormRedesigned from '@/components/SajuFormRedesigned';
import { calculateTojeong, TojeongResult } from '@/lib/tojeong-engine';
import { motion, AnimatePresence } from 'framer-motion';
import ShineBorder from '@/components/magicui/shine-border';
import { Sparkles, ScrollText, ArrowLeft } from 'lucide-react';

export default function TojeongPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [result, setResult] = useState<TojeongResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [aiInterpretation, setAiInterpretation] = useState<string>('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCalculate = async (data: any) => {
        setLoading(true);
        // data = { basic: { year, month, day, ... }, saju: ... }
        try {
            const targetYear = 2026; // Fixed for 2026 (or dynamic)
            const tojeong = calculateTojeong(
                data.basic.year,
                data.basic.month,
                data.basic.day,
                targetYear
            );
            setResult(tojeong);
            setStep(2);

            // Fetch AI Interpretation
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shamanId: 'master_cheon',
                    userSaju: {
                        birthDate: `${data.basic.year}-${data.basic.month}-${data.basic.day}`,
                        gender: data.basic.gender,
                        dayMaster: typeof data.saju.dayMaster === 'string' ? data.saju.dayMaster : data.saju.dayMaster?.hanja || ''
                    },
                    chatHistory: [],
                    message: `[시스템 요청] 2026년(병오년) 토정비결 괘: "${tojeong.code}" (${tojeong.meaning.sang}-${tojeong.meaning.joong}-${tojeong.meaning.ha}). 
                    
                    이 괘상을 바탕으로 2026년 한 해의 총운을 고전적이고 희망찬 문체로 풀이해주세요. 
                    다음 형식을 지켜주세요:
                    1. **총운 요약**: 50자 내외의 시적인 요약.
                    2. **재물운**: 재물 흐름에 대한 조언.
                    3. **처세술**: 인간관계와 태도에 대한 조언.
                    
                    전체 길이는 300자 내외로 핵심만 담아주세요.`
                })
            });
            const json = await res.json();
            if (json.reply) {
                setAiInterpretation(json.reply);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center md:items-center relative overflow-hidden">
             {/* Desktop Background: Subtle Gradient */}
             <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-zinc-950 to-zinc-950 pointer-events-none hidden md:block"></div>
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-950 to-zinc-950 pointer-events-none hidden md:block opacity-40"></div>

            {/* Main App Container */}
            <div className="w-full max-w-[430px] bg-zinc-950 min-h-screen md:min-h-[850px] md:h-[850px] md:rounded-[40px] md:border-[8px] md:border-zinc-900 md:shadow-2xl relative overflow-hidden flex flex-col mx-auto my-auto ring-1 ring-white/5 font-sans text-zinc-100 pb-14">
                
                {/* Mobile Background Effects (Inside Box) */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(234,179,8,0.15),_transparent_70%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                {/* Header */}
                <header className="w-full p-6 flex justify-between items-center z-20 shrink-0">
                    <button onClick={() => router.push('/')} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm backdrop-blur-md bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                        <ArrowLeft className="w-4 h-4" /> 홈으로
                    </button>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-yellow-500/80 uppercase tracking-widest">TOJEONG 2026</span>
                        <Sparkles className="w-3 h-3 text-yellow-500" />
                    </div>
                </header>

                <div className="w-full flex-1 flex flex-col relative z-10 pb-20 px-4 overflow-y-auto scrollbar-hide">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                            >
                                <div className="text-center mb-8 pt-4">
                                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-600 mb-2 drop-shadow-lg">
                                        2026<br/>토정비결
                                    </h1>
                                    <p className="text-white/50 text-sm">천기누설(天機漏洩) - 병오년(丙午年)의 운세를 미리 봅니다.</p>
                                </div>
                                <Suspense fallback={<div className="text-center text-sm text-zinc-400 py-10">폼을 불러오는 중입니다...</div>}>
                                    <SajuFormRedesigned onComplete={handleCalculate} skipAI={true} />
                                </Suspense>
                            </motion.div>
                        )}

                        {step === 2 && result && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6 pb-10"
                            >
                                {/* Code Badge */}
                                <div className="flex justify-center flex-col items-center gap-2">
                                    <div className="text-yellow-500 text-xs tracking-[0.3em] uppercase">Destiny Code</div>
                                    <span className="text-5xl font-serif text-white font-bold tracking-widest drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                        {result.code}
                                    </span>
                                </div>

                                {/* Main Card */}
                                <ShineBorder 
                                    className="w-full bg-zinc-900/50 border border-yellow-500/20 rounded-2xl p-0 relative overflow-hidden shadow-2xl" 
                                    color={["#FDE047", "#D97706", "#78350F"]} // Yellow/Gold/Brown
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
                                    
                                    <div className="p-6 relative z-10">
                                        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                                            <ScrollText className="w-5 h-5 text-yellow-400" />
                                            <h3 className="text-lg font-bold text-white">2026년 총운 풀이</h3>
                                        </div>

                                        {loading ? (
                                            <div className="flex flex-col items-center gap-4 py-12">
                                                <div className="relative">
                                                    <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                                                    <div className="absolute inset-0 flex items-center justify-center text-xs">🔮</div>
                                                </div>
                                                <span className="text-yellow-200/70 text-sm animate-pulse">천기를 읽어내는 중입니다...</span>
                                            </div>
                                        ) : (
                                            <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                                {aiInterpretation}
                                            </div>
                                        )}
                                    </div>
                                </ShineBorder>

                                {/* Monthly Flow Grid */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">🌙</span>
                                        <h4 className="text-white font-bold text-lg">월별 흐름</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {result.monthly.map((m) => (
                                            <motion.div
                                                key={m.month}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: m.month * 0.05 }}
                                                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-bold text-yellow-400">{m.monthName}</span>
                                                    <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-bold">
                                                        {m.keyword}
                                                    </span>
                                                </div>
                                                <div className="flex gap-0.5 mb-2">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <span key={i} className={`text-xs ${i < m.rating ? 'text-yellow-400' : 'text-white/20'}`}>★</span>
                                                    ))}
                                                </div>
                                                <p className="text-[11px] text-white/60 leading-relaxed">{m.fortune}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => { setStep(1); setResult(null); setAiInterpretation(''); }}
                                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold flex items-center justify-center gap-2 group"
                                >
                                    <Sparkles className="w-4 h-4 text-zinc-500 group-hover:text-yellow-400 transition-colors" />
                                    다른 생년월일 보기
                                </button>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
