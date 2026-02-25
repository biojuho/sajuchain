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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-4">
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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center min-h-[200px]">
                <div className="text-white/30 text-sm">불러오는 중...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-white/40 text-sm">
                리퍼럴 정보를 불러올 수 없습니다.
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
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
                className="bg-black/40 rounded-xl p-4 flex justify-between items-center border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-colors"
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
            <div className="bg-purple-900/10 border border-purple-500/10 rounded-xl p-4 space-y-2">
                <p className="text-xs text-purple-300 font-bold">보상 안내</p>
                <p className="text-xs text-white/50 leading-relaxed">
                    친구가 내 링크로 가입하면 <span className="text-purple-300 font-bold">프리미엄 AI 해석 1회 무료</span> 보상을 받습니다.
                    초대할 때마다 보상이 쌓여요!
                </p>
            </div>

            {/* Free Premium Status */}
            {data.freePremiumRemaining > 0 && (
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Crown className="w-6 h-6 text-amber-400" />
                        <div>
                            <p className="text-sm text-white font-bold">무료 프리미엄 {data.freePremiumRemaining}회</p>
                            <p className="text-[10px] text-white/40">사용 가능한 무료 프리미엄 해석</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClaim}
                        disabled={claiming}
                        className="px-4 py-2 bg-amber-500 text-black rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
                    >
                        {claiming ? '처리 중...' : '사용하기'}
                    </button>
                </div>
            )}

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/40">
                    <span>초대 현황</span>
                    <span>{data.inviteCount}명</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, data.inviteCount * 20)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
