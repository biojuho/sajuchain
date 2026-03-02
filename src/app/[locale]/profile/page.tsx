'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import {
    User,
    Crown,
    Clock,
    LogOut,
    LogIn,
    ChevronRight,
    Sparkles,
    History,
    Shield,
} from 'lucide-react';

function MenuRow({
    icon,
    label,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/5 transition-colors"
        >
            <span className="text-zinc-400">{icon}</span>
            <span className="text-white text-sm flex-1">{label}</span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>
    );
}

const STAGGER_DELAYS = [0, 0.1, 0.15, 0.2, 0.25, 0.3] as const;

export default function ProfilePage() {
    const router = useRouter();
    const {
        user,
        loading,
        avatarUrl,
        displayName,
        email,
        isPremium,
        freePremiumRemaining,
        totalAnalyses,
        lastAnalysis,
        dayMasterDisplay,
        handleLogout,
        handleLogin,
    } = useProfile();

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.08),transparent_50%)] pointer-events-none" />

            <div className="w-full max-w-[430px] min-h-screen relative pb-20">
                {/* Header */}
                <div className="relative px-6 pt-12 pb-6">
                    <h1 className="text-xl font-bold text-white">마이페이지</h1>
                </div>

                {/* User Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                >
                    {user ? (
                        <div className="flex items-center gap-4">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="avatar"
                                    width={56}
                                    height={56}
                                    className="rounded-full border-2 border-purple-500/50"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-purple-900/50 border-2 border-purple-500/30 flex items-center justify-center">
                                    <User className="w-6 h-6 text-purple-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-white font-semibold truncate">
                                        {displayName}
                                    </p>
                                    {isPremium && (
                                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                                            <Crown className="w-3 h-3" />
                                            PRO
                                        </span>
                                    )}
                                </div>
                                <p className="text-zinc-400 text-sm truncate">
                                    {email}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="w-full flex items-center justify-center gap-2 py-3 text-purple-400 font-medium"
                        >
                            <LogIn className="w-5 h-5" />
                            로그인하기
                        </button>
                    )}
                </motion.div>

                {/* Premium Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: STAGGER_DELAYS[1] }}
                    className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-xs mb-1">구독 상태</p>
                            <p className="text-white font-semibold">
                                {isPremium ? 'Premium 활성' : 'Free 플랜'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-zinc-400 text-xs mb-1">무료 분석 잔여</p>
                            <p className="text-purple-400 font-bold text-lg">
                                {freePremiumRemaining}
                                <span className="text-xs text-zinc-500 ml-0.5">회</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Day Master Badge */}
                {dayMasterDisplay && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: STAGGER_DELAYS[2] }}
                        className="mx-4 mt-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-900/50 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-zinc-400 text-xs">나의 일간</p>
                                <p className="text-white font-semibold">
                                    {dayMasterDisplay}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: STAGGER_DELAYS[3] }}
                    className="mx-4 mt-4 grid grid-cols-2 gap-3"
                >
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <History className="w-4 h-4 text-zinc-500 mb-2" />
                        <p className="text-2xl font-bold text-white">{totalAnalyses}</p>
                        <p className="text-zinc-500 text-xs">총 분석 횟수</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <Clock className="w-4 h-4 text-zinc-500 mb-2" />
                        <p className="text-sm font-semibold text-white mt-1">{lastAnalysis}</p>
                        <p className="text-zinc-500 text-xs mt-1">마지막 분석</p>
                    </div>
                </motion.div>

                {/* Menu List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: STAGGER_DELAYS[4] }}
                    className="mx-4 mt-6"
                >
                    <p className="text-zinc-500 text-xs font-medium mb-2 px-1">메뉴</p>
                    <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/5 overflow-hidden">
                        <MenuRow
                            icon={<History className="w-4 h-4" />}
                            label="분석 기록"
                            onClick={() => router.push('/dojo')}
                        />
                        <MenuRow
                            icon={<Shield className="w-4 h-4" />}
                            label="결제 내역"
                            onClick={() => router.push('/payment/success')}
                        />
                    </div>
                </motion.div>

                {/* Logout */}
                {user && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: STAGGER_DELAYS[5] }}
                        className="mx-4 mt-8 mb-8"
                    >
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            로그아웃
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
