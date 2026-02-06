'use client';

import { useState } from 'react';
import { calculateSaju } from '@/lib/saju-engine';

export default function SajuForm({ onComplete }: { onComplete: (data: any) => void }) {
    const [formData, setFormData] = useState({
        year: 1990,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        gender: 'M' as 'M' | 'F',
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
                formData.minute
            );

            // 2. Call AI API
            const response = await fetch('/api/interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthDate: `${formData.year}-${formData.month}-${formData.day} ${formData.hour}:${formData.minute}`,
                    gender: formData.gender,
                    yearPillar: sajuResult.fourPillars.year,
                    monthPillar: sajuResult.fourPillars.month,
                    dayPillar: sajuResult.fourPillars.day,
                    hourPillar: sajuResult.fourPillars.hour,
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
        <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl space-y-4">
            <h2 className="text-2xl font-bold text-center text-white mb-6">내 운명 확인하기 🔮</h2>

            <div className="grid grid-cols-3 gap-2">
                <label className="block text-white">
                    <span className="text-sm opacity-80">년</span>
                    <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </label>
                <label className="block text-white">
                    <span className="text-sm opacity-80">월</span>
                    <input
                        type="number"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </label>
                <label className="block text-white">
                    <span className="text-sm opacity-80">일</span>
                    <input
                        type="number"
                        value={formData.day}
                        onChange={(e) => setFormData({ ...formData, day: Number(e.target.value) })}
                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <label className="block text-white">
                    <span className="text-sm opacity-80">시 (0-23)</span>
                    <input
                        type="number"
                        value={formData.hour}
                        onChange={(e) => setFormData({ ...formData, hour: Number(e.target.value) })}
                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </label>
                <label className="block text-white">
                    <span className="text-sm opacity-80">성별</span>
                    <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                        <option value="M">남성</option>
                        <option value="F">여성</option>
                    </select>
                </label>
            </div>

            {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm text-center animate-pulse">
                    ⚠️ {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? '천기누설 중... ⚡' : '운세 보기'}
            </button>
        </form>
    );
}
