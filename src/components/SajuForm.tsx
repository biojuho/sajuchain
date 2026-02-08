'use client';

import { useState } from 'react';
import { calculateSaju, SajuResult } from '@/lib/saju-engine';
import { AIResult } from '@/types';

interface SajuFormData {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: 'M' | 'F';
    calendarType: 'solar' | 'lunar';
    birthPlace: string;
}

interface OnCompleteData {
    saju: SajuResult;
    ai: AIResult;
    basic: SajuFormData;
}

export default function SajuForm({ onComplete, submitLabel = '운세 보기 ✨' }: { onComplete: (data: OnCompleteData) => void, submitLabel?: string }) {
    const [formData, setFormData] = useState<SajuFormData>({
        year: 1990,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        gender: 'M',
        calendarType: 'solar',
        birthPlace: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Calculate Saju (Client-side)
            const sajuResult = calculateSaju(
                formData.year,
                formData.month,
                formData.day,
                formData.hour,
                formData.minute,
                formData.gender,
                formData.calendarType
            );

            // 2. Call AI API
            const response = await fetch('/api/interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthDate: `${formData.year}-${formData.month}-${formData.day} ${formData.hour}:${formData.minute}`,
                    gender: formData.gender,
                    calendarType: formData.calendarType,
                    birthPlace: formData.birthPlace,
                    yearPillar: sajuResult.fourPillars.year,
                    monthPillar: sajuResult.fourPillars.month,
                    dayPillar: sajuResult.fourPillars.day,
                    hourPillar: sajuResult.fourPillars.hour,
                    daewoon: sajuResult.daewoon,
                    fiveElements: sajuResult.fiveElements,
                    dayMaster: sajuResult.dayMaster,
                }),
            });

            const aiResult = await response.json();

            if (response.ok) {
                onComplete({ saju: sajuResult, ai: aiResult, basic: formData });
            } else {
                setError(aiResult.error || 'AI 해석에 실패했습니다.');
            }

        } catch (error: any) {
            console.error(error);
            setError(error.message || '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md p-6 md:p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_40px_-10px_rgba(124,58,237,0.3)] space-y-6 relative overflow-hidden">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 mb-8 font-serif relative z-10">
                내 운명 확인하기 🔮
            </h2>

            <div className="grid grid-cols-3 gap-2 md:gap-3 relative z-10">
                <label className="block text-white group">
                    <span className="text-xs text-purple-200/60 mb-1 block uppercase tracking-wider">Year</span>
                    <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="w-full bg-black/20 border border-white/5 rounded-lg p-2.5 md:p-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-all text-center font-mono text-sm md:text-base"
                    />
                </label>
                <label className="block text-white group">
                    <span className="text-xs text-purple-200/60 mb-1 block uppercase tracking-wider">Month</span>
                    <input
                        type="number"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                        className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-all text-center font-mono"
                    />
                </label>
                <label className="block text-white group">
                    <span className="text-xs text-purple-200/60 mb-1 block uppercase tracking-wider">Day</span>
                    <input
                        type="number"
                        value={formData.day}
                        onChange={(e) => setFormData({ ...formData, day: Number(e.target.value) })}
                        className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-all text-center font-mono"
                    />
                </label>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
                <label className="block text-white group">
                    <span className="text-xs text-purple-200/60 mb-1 block uppercase tracking-wider">Hour (0-23)</span>
                    <input
                        type="number"
                        value={formData.hour}
                        onChange={(e) => setFormData({ ...formData, hour: Number(e.target.value) })}
                        className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-all text-center font-mono"
                    />
                </label>
                <label className="block text-white group">
                    <span className="text-xs text-purple-200/60 mb-1 block uppercase tracking-wider">Minute</span>
                    <input
                        type="number"
                        value={formData.minute}
                        onChange={(e) => setFormData({ ...formData, minute: Number(e.target.value) })}
                        className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-all text-center font-mono"
                    />
                </label>
            </div>

            <label className="block text-white group relative z-10">
                <span className="text-xs text-purple-200/60 mb-1 block uppercase tracking-wider">Birth Region (City)</span>
                <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="e.g. Seoul, Busan"
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-all text-center"
                />
            </label>

            <label className="block text-white group relative z-10">
                <span className="text-xs text-purple-200/60 mb-1 block uppercase tracking-wider">Gender</span>
                <div className="relative">
                    <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                        className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-all appearance-none text-center cursor-pointer"
                    >
                        <option value="M" className="bg-gray-900">Male</option>
                        <option value="F" className="bg-gray-900">Female</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">▼</div>
                </div>
            </label>

            {/* Calendar Type Toggle */}
            <div className="flex bg-black/20 rounded-lg p-1 relative z-10 border border-white/5">
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, calendarType: 'solar' })}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${formData.calendarType === 'solar'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Solar (양력)
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, calendarType: 'lunar' })}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${formData.calendarType === 'lunar'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Lunar (음력)
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-200 text-sm text-center animate-pulse relative z-10 backdrop-blur-sm">
                    ⚠️ {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group z-10"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="animate-pulse">천기누설 중...</span>
                    </div>
                ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {submitLabel}
                    </span>
                )}
            </button>
        </form>
    );
}
