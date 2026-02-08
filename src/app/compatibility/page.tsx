
'use client';

import { useState } from 'react';
import SajuForm from '@/components/SajuForm';
import CompatibilityResultView from '@/components/Saju/CompatibilityResultView';
import { SajuData, CompatibilityResult } from '@/types';
import { calculateCompatibility } from '@/lib/saju-engine';
import { motion } from 'framer-motion';
import ShareButton from '@/components/share/ShareButton';
import CardPreviewModal from '@/components/share/CardPreviewModal';

export default function CompatibilityPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [sajuA, setSajuA] = useState<SajuData | null>(null);
    const [sajuB, setSajuB] = useState<SajuData | null>(null);
    const [result, setResult] = useState<CompatibilityResult | null>(null);
    const [isShareOpen, setIsShareOpen] = useState(false);

    const handleCompleteA = (data: any) => { // Type as OnCompleteData but imports might be tricky from component
        // Construct full SajuData
        const fullData: SajuData = {
            birthDate: `${data.basic.year}-${data.basic.month}-${data.basic.day}`,
            gender: data.basic.gender,
            fourPillars: data.saju.fourPillars,
            fiveElements: data.saju.fiveElements,
            daewoon: data.saju.daewoon,
            dayMaster: data.saju.dayMaster
        };
        setSajuA(fullData);
        setStep(2);
    };

    const handleCompleteB = (data: any) => {
        const fullData: SajuData = {
            birthDate: `${data.basic.year}-${data.basic.month}-${data.basic.day}`,
            gender: data.basic.gender,
            fourPillars: data.saju.fourPillars,
            fiveElements: data.saju.fiveElements,
            daewoon: data.saju.daewoon,
            dayMaster: data.saju.dayMaster
        };
        setSajuB(fullData);
        if (sajuA) {
            const compResult = calculateCompatibility(sajuA, fullData);
            setResult(compResult);
            setStep(3);
        }
    };

    return (
        <main className="min-h-screen bg-black flex justify-center items-center p-0 md:p-8 overflow-hidden font-sans">
            <div className="w-full max-w-md h-full min-h-screen md:min-h-[800px] md:h-auto bg-gradient-to-b from-[#0A0E27] to-[#1A0B2E] text-white flex flex-col relative shadow-2xl md:rounded-3xl border border-white/10 overflow-hidden">
                <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-white/50 hover:text-white transition-colors flex items-center gap-1 text-sm pointer-events-auto"
                    >
                        <span>&larr;</span> Home
                    </button>
                    <h1 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-400 uppercase tracking-widest">
                        Chemistry
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto pt-20 pb-10 px-6 scrollbar-hide">
                    <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                        Soulmate <br /> Compatibility
                    </h2>

                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <h3 className="text-sm font-bold mb-4 text-center text-white/60 uppercase tracking-wider border-b border-white/10 pb-2 mx-10">Step 1: Your Info</h3>
                            <SajuForm onComplete={handleCompleteA} submitLabel="Next: Enter Partner Info" />
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h3 className="text-sm font-bold mb-4 text-center text-white/60 uppercase tracking-wider border-b border-white/10 pb-2 mx-10">Step 2: Partner's Info</h3>
                            <SajuForm onComplete={handleCompleteB} submitLabel="Reveal Chemistry" />
                            <button
                                onClick={() => setStep(1)}
                                className="w-full mt-4 text-xs text-white/30 hover:text-white/50 py-2"
                            >
                                &larr; Back to Step 1
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && result && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <CompatibilityResultView result={result} />

                            <div className="mt-6 flex justify-center">
                                <ShareButton onClick={() => setIsShareOpen(true)} label="Share Chemistry Card" />
                            </div>

                            <button
                                onClick={() => { setStep(1); setSajuA(null); setSajuB(null); setResult(null); }}
                                className="w-full mt-4 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white font-bold shadow-lg"
                            >
                                Check Another Couple
                            </button>

                            <CardPreviewModal
                                isOpen={isShareOpen}
                                onClose={() => setIsShareOpen(false)}
                                data={result}
                                type="compatibility"
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}
