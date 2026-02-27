'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Gift, Check, Users, Crown, LogIn } from 'lucide-react';
import { useSajuStore } from '@/lib/store';
import { getReferralData, claimFreePremium, ReferralData } from '@/lib/referral';

export default function ReferralDashboard() {
    const { user } = useSajuStore();
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [claiming, setClaiming] = useState(false);

    useEffect(() => {
        if (user) {
            getReferralData(user.id).then((d) => {
                setData(d);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [user]);

    const copyCode = async () => {
        if (!data) return;
        const shareUrl = `${window.location.origin}?ref=${data.referralCode}`;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClaim = async () => {
        if (!user || !data || data.freePremiumRemaining <= 0) return;
        setClaiming(true);
        const ok = await claimFreePremium(user.id);
        if (ok) {
            setData({ ...data, freePremiumRemaining: data.freePremiumRemaining - 1 });
        }
        setClaiming(false);
    };

    // Guest view
    if (!user) {
        return (
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden group">
                {/* Subtle Glow */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />
                <Gift className="w-8 h-8 text-purple-400 mx-auto" />
                <h3 className="text-white font-bold">친구 초대 보상</h3>
                <p className="text-white/50 text-sm">
                    로그인하면 나만의 초대 코드를 받을 수 있어요.<br />
                    친구 1명 가입 시 프리미엄 해석 1회 무료!
                </p>
                <a
                    href="/auth"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-full text-sm font-bold hover:bg-purple-500 transition-colors"
                >
                    <LogIn className="w-4 h-4" />
                    로그인하기
                </a>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex items-center justify-center min-h-[200px] shadow-2xl">
                <div className="text-white/30 text-sm font-medium animate-pulse">불러오는 중...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-center text-white/40 text-sm font-medium shadow-2xl">
                리퍼럴 정보를 불러올 수 없습니다.
            </div>
        );
    }

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden group">
             {/* Dynamic Accent Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial-gradient from-purple-500/5 to-transparent blur-[80px] pointer-events-none transition-opacity duration-1000 opacity-30 group-hover:opacity-60" />

            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-400" />
                    친구 초대 보상
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/50 bg-black/30 px-3 py-1 rounded-full">
                    <Users className="w-3 h-3" />
                    <span>{data.inviteCount}명 초대됨</span>
                </div>
            </div>

            {/* Invite Code Box */}
            <div
                className="relative z-10 bg-black/60 rounded-2xl p-5 flex justify-between items-center border border-white/10 group/box cursor-pointer hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300"
                onClick={copyCode}
            >
                <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">내 초대 코드</p>
                    <p className="text-xl font-mono font-bold text-white tracking-wider">{data.referralCode}</p>
                </div>
                <button type="button" aria-label="Copy code" className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                    {copied ? (
                        <Check className="w-5 h-5 text-green-400" />
                    ) : (
                        <Copy className="w-5 h-5 text-white/70" />
                    )}
                </button>
            </div>

            {/* How it works */}
            <div className="relative z-10 bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/10 rounded-2xl p-5 space-y-2">
                <p className="text-xs text-purple-300 font-bold">보상 안내</p>
                <p className="text-xs text-white/50 leading-relaxed">
                    친구가 내 링크로 가입하면 <span className="text-purple-300 font-bold">프리미엄 AI 해석 1회 무료</span> 보상을 받습니다.
                    초대할 때마다 보상이 쌓여요!
                </p>
            </div>

            {/* Free Premium Status */}
            {data.freePremiumRemaining > 0 && (
                <div className="relative z-10 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <Crown className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-white font-bold tracking-wide">무료 프리미엄 {data.freePremiumRemaining}회</p>
                            <p className="text-[11px] text-white/50 mt-0.5">사용 가능한 무료 프리미엄 해석</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClaim}
                        disabled={claiming}
                        className="px-5 py-2.5 bg-amber-500 text-black rounded-xl text-xs font-bold hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    >
                        {claiming ? '연결 중...' : '사용하기'}
                    </button>
                </div>
            )}

            {/* Progress */}
            <div className="relative z-10 space-y-3 pt-2">
                <div className="flex justify-between text-xs text-white/50 font-medium px-1">
                    <span>초대 현황 현황</span>
                    <span className="text-white font-bold">{data.inviteCount}명</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        style={{ width: `${Math.min(100, data.inviteCount * 20)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
