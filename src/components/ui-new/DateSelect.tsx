
'use client';

import React, { useRef, useEffect } from 'react';

// Simplified scroll selector to mimic "Drum Picker" style visually
// In a real production app, we might use a dedicated library or more complex scroll snap logic
// Here we use native select for accessibility but styled heavily, OR custom div logic.
// Plan: Custom Trigger that opens a native bottom sheet on mobile (using native input type="date")
// BUT User asked for specific "Year/Month/Day" drum style.
// Let's build a nice custom trigger that LOOKS like a drum picker but opens a native date picker for best mobile experience (reliability),
// OR simple dropdowns.
// Given "Drum Picker Style" requirement, let's make 3 custom select boxes that look sleek.

interface DateSelectProps {
    year: number;
    month: number;
    day: number;
    onChange: (y: number, m: number, d: number) => void;
}

export const DateSelect = ({ year, month, day, onChange }: DateSelectProps) => {
    const years = Array.from({ length: 100 }, (_, i) => 2025 - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="flex gap-2 w-full">
            <div className="flex-1 relative group">
                <label className="absolute -top-3 left-2 text-[10px] text-purple-300 bg-[#1a0a2e] px-1 rounded">YEAR</label>
                <select
                    value={year}
                    onChange={(e) => onChange(Number(e.target.value), month, day)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-purple-500 transition-colors text-center font-bold text-lg"
                >
                    {years.map(y => <option key={y} value={y} className="text-black">{y}년</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">▼</div>
            </div>

            <div className="flex-1 relative group">
                <label className="absolute -top-3 left-2 text-[10px] text-purple-300 bg-[#1a0a2e] px-1 rounded">MONTH</label>
                <select
                    value={month}
                    onChange={(e) => onChange(year, Number(e.target.value), day)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-purple-500 transition-colors text-center font-bold text-lg"
                >
                    {months.map(m => <option key={m} value={m} className="text-black">{m}월</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">▼</div>
            </div>

            <div className="flex-1 relative group">
                <label className="absolute -top-3 left-2 text-[10px] text-purple-300 bg-[#1a0a2e] px-1 rounded">DAY</label>
                <select
                    value={day}
                    onChange={(e) => onChange(year, month, Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-purple-500 transition-colors text-center font-bold text-lg"
                >
                    {days.map(d => <option key={d} value={d} className="text-black">{d}일</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">▼</div>
            </div>
        </div>
    );
};
