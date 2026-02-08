
'use client';

import React from 'react';
import { Compass } from 'lucide-react';

interface LuckyItemsProps {
    items: {
        color: { name: string; hex: string };
        number: number | string;
        direction: string; // "North", "East" etc
    };
}

export const LuckyItemsGrid = ({ items }: LuckyItemsProps) => {
    // Map direction to rotate degrees
    const getRotation = (dir: string) => {
        const d = dir.toLowerCase();
        if (d.includes('north')) return 0;
        if (d.includes('east')) return 90;
        if (d.includes('south')) return 180;
        if (d.includes('west')) return 270;
        return 0;
    };

    return (
        <section className="mx-5 mb-6 px-5 py-5 bg-zinc-900 border border-white/5 rounded-[20px]">
            <h3 className="text-base font-bold text-zinc-50 mb-4">🍀 행운의 아이템</h3>
            <div className="grid grid-cols-3 gap-3">
                {/* Color */}
                <div className="bg-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2">
                    <div
                        className="w-10 h-10 rounded-full border-2 border-white/10 shadow-lg"
                        style={{ backgroundColor: items.color.hex }}
                    />
                    <div className="text-center">
                        <p className="text-[10px] text-zinc-500 font-bold mb-0.5">COLOR</p>
                        <p className="text-[13px] font-bold text-zinc-50">{items.color.name}</p>
                    </div>
                </div>

                {/* Number */}
                <div className="bg-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-lg">
                        {items.number}
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-zinc-500 font-bold mb-0.5">NUMBER</p>
                        <p className="text-[13px] font-bold text-zinc-50">{items.number}</p>
                    </div>
                </div>

                {/* Direction */}
                <div className="bg-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Compass className="w-5 h-5 transition-transform duration-700" style={{ transform: `rotate(${getRotation(items.direction)}deg)` }} />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-zinc-500 font-bold mb-0.5">DIRECTION</p>
                        <p className="text-[13px] font-bold text-zinc-50">{items.direction}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
