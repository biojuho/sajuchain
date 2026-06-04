'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TRIVIA = [
    "우주가 당신의 운명 좌표를 계산하고 있습니다...",
    "일주(日柱)는 당신이 태어난 날의 에너지입니다.",
    "대운은 10년마다 찾아오는 인생의 계절입니다.",
    "오행의 균형 속에 당신의 잠재력이 숨어있습니다.",
    "사주는 정해진 운명이 아닌, 흐름을 읽는 지혜입니다.",
    "당신의 태어난 시간은 우주가 선물한 암호입니다.",
    "음양의 조화가 당신의 삶에 리듬을 만듭니다."
];

export function LoadingOracle() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % TRIVIA.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl text-white overflow-hidden">
            {/* Background Starfield effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2e1065_0%,_#000000_100%)] opacity-60" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_1px,_transparent_1px)] [background-size:18px_18px] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />

            {/* Cosmic Orbit Animation */}
            <div className="relative mb-16 scale-125">
                {/* Core Star */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 20px #a855f7", "0 0 40px #a855f7", "0 0 20px #a855f7"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                >
                    <span className="text-2xl filter drop-shadow-lg">🔮</span>
                </motion.div>

                {/* Orbit 1 */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-purple-500/30 border-t-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                />

                {/* Orbit 2 */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-blue-500/20 border-b-blue-400"
                />

                {/* Orbit 3 (Elliptical) */}
                <motion.div
                    animate={{ rotate: 180, scale: [1, 1.05, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/5 border-l-white/20 dashed"
                />
            </div>

            {/* Typing Text / Trivia */}
            <div className="relative z-10 w-full max-w-md text-center h-24 flex flex-col items-center justify-center px-6">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.8 }}
                        className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-purple-200 leading-relaxed"
                    >
                        &quot;{TRIVIA[index]}&quot;
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="relative z-10 w-48 h-1 bg-white/10 rounded-full mt-8 overflow-hidden">
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 8, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                />
            </div>

            <p className="mt-4 text-xs font-medium text-purple-300/50 animate-pulse tracking-widest uppercase">
                Analyzing Celestial Coordinates...
            </p>
        </div>
    );
}
