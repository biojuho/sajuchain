
import React, { useState } from 'react';
import { Copy, Gift, Lock, Unlock, Users } from 'lucide-react';

const REWARDS = [
    { tier: 1, label: "Premium Saju (1 Free)", required: 1 },
    { tier: 3, label: "NFT Minting 30% Off", required: 3 },
    { tier: 5, label: "Limited Edition NFT", required: 5 },
];

export default function ReferralDashboard() {
    // Mock State - In a real app this comes from backend
    const [inviteCount, setInviteCount] = useState(2);
    const inviteCode = "SAJU-A3K9";

    const copyCode = () => {
        navigator.clipboard.writeText(inviteCode);
        alert(`Invite code ${inviteCode} copied!`);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-400" />
                    Invite Rewards <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded ml-2">DEMO</span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/50 bg-black/30 px-3 py-1 rounded-full">
                    <Users className="w-3 h-3" />
                    <span>{inviteCount} friends invited</span>
                </div>
            </div>

            {/* Invite Code Box */}
            <div className="bg-black/40 rounded-xl p-4 flex justify-between items-center border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-colors" onClick={copyCode}>
                <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Your Invite Code</p>
                    <p className="text-xl font-mono font-bold text-white tracking-wider">{inviteCode}</p>
                </div>
                <button className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                    <Copy className="w-5 h-5 text-white/70" />
                </button>
            </div>

            {/* Reward Tiers */}
            <div className="space-y-3">
                {REWARDS.map((reward, i) => {
                    const isUnlocked = inviteCount >= reward.required;
                    const progress = Math.min(100, (inviteCount / reward.required) * 100);

                    return (
                        <div key={i} className={`relative overflow-hidden rounded-xl border transition-all ${isUnlocked ? 'bg-purple-900/20 border-purple-500/30' : 'bg-white/5 border-white/5 opacity-60'}`}>
                            {/* Progress Bar (Background) */}
                            {!isUnlocked && (
                                <div
                                    className="absolute inset-y-0 left-0 bg-white/5 z-0 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            )}

                            <div className="relative z-10 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white/10 text-white/30'}`}>
                                        {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-white/50'}`}>{reward.label}</p>
                                        <p className="text-[10px] text-white/30">Invite {reward.required} friends to unlock</p>
                                    </div>
                                </div>
                                {isUnlocked && (
                                    <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-2 py-1 rounded">CLAIM</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
