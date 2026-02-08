
'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface DateScrollPickerProps {
    year: number;
    month: number;
    day: number;
    onChange: (y: number, m: number, d: number) => void;
}

export const DateScrollPicker = ({ year, month, day, onChange }: DateScrollPickerProps) => {
    const years = Array.from({ length: 100 }, (_, i) => 2025 - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const selectBaseClass = "w-full h-14 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-white appearance-none focus:outline-none focus:border-purple-500 transition-all font-bold text-xl pl-4 pr-10 relative z-10";
    const labelClass = "absolute -top-3 left-2 text-[10px] text-purple-200 bg-[#1a0a2e] px-1 rounded z-20"; // Background matches dark theme assumption

    return (
        <div className="flex gap-3 w-full">
            {/* Year */}
            <div className="flex-1 relative">
                <label className={labelClass}>년</label>
                <select
                    value={year}
                    onChange={(e) => onChange(Number(e.target.value), month, day)}
                    className={selectBaseClass}
                >
                    {years.map(y => <option key={y} value={y} className="text-black">{y}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none w-5 h-5 z-10" />
            </div>

            {/* Month */}
            <div className="flex-1 relative">
                <label className={labelClass}>월</label>
                <select
                    value={month}
                    onChange={(e) => onChange(year, Number(e.target.value), day)}
                    className={selectBaseClass}
                >
                    {months.map(m => <option key={m} value={m} className="text-black">{m}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none w-5 h-5 z-10" />
            </div>

            {/* Day */}
            <div className="flex-1 relative">
                <label className={labelClass}>일</label>
                <select
                    value={day}
                    onChange={(e) => onChange(year, month, Number(e.target.value))}
                    className={selectBaseClass}
                >
                    {days.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none w-5 h-5 z-10" />
            </div>
        </div>
    );
};
