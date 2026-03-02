'use client';
 

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSajuStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { SajuData } from '@/types';

interface HistoryPageProps {
    onBack: () => void;
    onSelect: (data: SajuData) => void;
}

export default function HistoryPage({ onBack, onSelect }: HistoryPageProps) {
    const router = useRouter();
    const { history, user, reset } = useSajuStore();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleLogin = () => {
        router.push('/auth');
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        // Supabase logout
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        reset(); // Clear local user state
        setIsLoggingOut(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen font-sans text-zinc-50 p-5 pb-20 relative"
        >
            <div className="flex items-center justify-between mb-8 mt-2 relative z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} aria-label="Go back" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <span className="text-zinc-400 text-lg">←</span>
                    </button>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-300 to-white">
                        My Dojo
                    </h1>
                </div>

                {user ? (
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full cursor-pointer hover:bg-red-500/20 transition-all"
                    >
                        {isLoggingOut ? 'Logging out...' : 'Sign Out'}
                    </button>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="text-xs font-bold text-white bg-white/10 border border-white/20 px-4 py-2 rounded-full cursor-pointer hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                        Login to Sync
                    </button>
                )}
            </div>

            {!user && (
                <div className="bg-gradient-to-r from-white/10 to-transparent border-l-2 border-white/50 p-4 rounded-r-2xl mb-8 flex gap-3 items-start relative z-10 backdrop-blur-md">
                    <span className="text-xl">☁️</span>
                    <div className="text-xs text-zinc-300 leading-relaxed">
                        <span className="font-bold text-white">클라우드 동기화</span><br />
                        로그인하면 기록이 영구 저장되고 다른 기기에서도 이어서 볼 수 있습니다.
                    </div>
                </div>
            )}

            {history.length === 0 ? (
                <div className="text-center text-zinc-500 mt-24 relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                        📭
                    </div>
                    <div className="text-lg font-bold text-zinc-300 mb-2">아직 기록이 없습니다</div>
                    <div className="text-sm text-zinc-500 max-w-[200px]">사주를 분석하고 나만의 운세 기록을 쌓아보세요.</div>
                </div>
            ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-gradient-to-b before:from-zinc-500/50 before:to-transparent z-10">
                    {history.map((record, i: number) => {
                        const score = record.fortuneSnapshot?.overall?.score;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative"
                            >
                                <div className="absolute -left-[29px] top-4 w-[11px] h-[11px] rounded-full bg-zinc-300 border-2 border-black shadow-[0_0_10px_rgba(255,255,255,0.3)] z-10" />

                                <motion.div
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onSelect(record)}
                                    className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 cursor-pointer flex justify-between items-center shadow-lg transition-all hover:bg-white/5 hover:border-zinc-300/50 group"
                                >
                                    <div className="flex-1 overflow-hidden pr-4">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="text-sm font-black text-zinc-200">
                                                {record.birthDate.replace(/-/g, '.')}
                                            </div>
                                            <div className="text-[10px] font-medium text-zinc-500 px-1.5 py-0.5 bg-white/5 rounded">
                                                {record.birthTime}
                                            </div>
                                            {record.gender === 'male' ? <span className="text-xs opacity-80">👨</span> : <span className="text-xs opacity-80">👩</span>}
                                        </div>
                                        <div className="text-[13px] text-zinc-400 truncate leading-snug group-hover:text-zinc-300 transition-colors">
                                            {record.aiResult?.headline || "기본 사주 분석 기록"}
                                        </div>
                                    </div>
                                    
                                    {score && (
                                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 shrink-0">
                                            <span className="text-[10px] text-zinc-400 font-bold mb-0.5">운세</span>
                                            <span className="text-sm font-black text-white">{score}</span>
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
