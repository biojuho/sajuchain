'use client';

import { motion } from 'framer-motion';
import { FourPillarsData } from '@/types';

const ELEMENT_COLORS: Record<string, string> = {
    '목(木)': 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]',
    '화(火)': 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]',
    '토(土)': 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]',
    '금(金)': 'text-gray-200 drop-shadow-[0_0_8px_rgba(229,231,235,0.5)]',
    '수(水)': 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]',
};

const pillarNames = {
    yearPillar: '년주 (Year)',
    monthPillar: '월주 (Month)',
    dayPillar: '일주 (Day)',
    hourPillar: '시주 (Hour)',
};

export default function FourPillars({ data }: { data: FourPillarsData }) {
    const pillars = [
        { key: 'yearPillar', ...data.yearPillar },
        { key: 'monthPillar', ...data.monthPillar },
        { key: 'dayPillar', ...data.dayPillar },
        { key: 'hourPillar', ...data.hourPillar },
    ] as const;

    const containerVariant = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariant}
            initial="hidden"
            animate="show"
            className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 my-8 px-4"
        >
            {pillars.map((p) => (
                <motion.div
                    key={p.key}
                    variants={itemVariant}
                    className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-md hover:bg-white/10 transition-colors duration-300"
                >
                    <span className="text-xs md:text-sm text-white/40 mb-3 tracking-wider uppercase font-medium">
                        {pillarNames[p.key as keyof typeof pillarNames]}
                    </span>

                    {/* 천간 */}
                    <div className="flex flex-col items-center mb-4 relative">
                        <span className={`text-4xl md:text-5xl font-serif font-bold ${ELEMENT_COLORS[p.element || ''] || 'text-white'}`}>
                            {p.heavenlyStem}
                        </span>
                        <span className="text-[10px] md:text-xs text-white/50 mt-1 font-light border border-white/10 rounded-full px-2 py-0.5">
                            {p.element || '행(行)'}
                        </span>
                    </div>
                    {/* 지지 */}
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-4xl font-serif font-bold text-white/80">
                            {p.earthlyBranch}
                        </span>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
