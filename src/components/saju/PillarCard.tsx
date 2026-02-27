
import React from 'react';
/* hint-disable no-inline-styles */
import { E_COLOR } from '@/lib/ui-constants';

interface PillarCardProps {
    label: string;
    data: {
        stem: string;
        stemName: string;
        stemElement: string;
        branch: string;
        branchName: string;
        branchElement: string;
        tenGod?: string;
        unseong?: string;
    };
    isMe?: boolean;
}

export function PillarCard({ label, data, isMe }: PillarCardProps) {
    const stemColor = E_COLOR[data.stemElement] || '#71717a';
    const branchColor = E_COLOR[data.branchElement] || '#71717a';
    const [stemTenGod] = (data.tenGod || "/").split("/");
    const [, branchTenGod] = (data.tenGod || "/").split("/");

    return (
        <div 
            className={`relative flex flex-col items-center gap-[6px] py-[10px] px-1 rounded-[14px] min-w-[70px] ${
                isMe 
                ? "bg-purple-500/10 border border-purple-500/25" 
                : "bg-zinc-800 border border-white/5"
            }`}
        >
            {isMe && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] font-bold px-2 py-[2px] rounded-lg whitespace-nowrap z-10 shadow-sm">
                    ★ 나
                </div>
            )}

            {/* Label */}
            <div className={`text-[11px] font-semibold text-zinc-400 ${isMe ? "mt-[6px]" : "mt-[2px]"}`}>
                {label}
            </div>

            {/* Heavenly Stem */}
            <div className="flex flex-col items-center gap-[1px] w-full">
                {/* Ten God (Stem) */}
                <div className="text-[9px] text-zinc-400 h-3 overflow-visible whitespace-nowrap">
                    {stemTenGod}
                </div>

                <div
                    className="w-10 h-10 rounded-[10px] flex flex-col items-center justify-center border-[1.5px] bg-[var(--bg-color)] border-[var(--border-color)]"
                    style={{
                        '--bg-color': `${stemColor}15`,
                        '--border-color': `${stemColor}40`,
                    } as React.CSSProperties}
                >
                    <span className="text-lg font-bold leading-none text-[var(--text-color)]" style={{ '--text-color': stemColor } as React.CSSProperties}>{data.stem}</span>
                    <span className="text-[8px] opacity-80 text-[var(--text-color)]" style={{ '--text-color': stemColor } as React.CSSProperties}>{data.stemElement}</span>
                </div>
                {/* Stem Name */}
                <span className="text-[9px] text-zinc-600 dark:text-zinc-500">{data.stemName}</span>
            </div>

            <div className="w-[80%] h-[1px] bg-white/5 my-[2px]" />

            {/* Earthly Branch */}
            <div className="flex flex-col items-center gap-[1px] w-full">
                {/* Ten God (Branch) */}
                <div className="text-[9px] text-zinc-400 h-3 overflow-visible whitespace-nowrap">
                    {branchTenGod}
                </div>

                <div
                    className="w-10 h-10 rounded-[10px] flex flex-col items-center justify-center border-[1.5px] bg-[var(--bg-color)] border-[var(--border-color)]"
                    style={{
                        '--bg-color': `${branchColor}15`,
                        '--border-color': `${branchColor}40`,
                    } as React.CSSProperties}
                >
                    <span className="text-lg font-bold leading-none text-[var(--text-color)]" style={{ '--text-color': branchColor } as React.CSSProperties}>{data.branch}</span>
                    <span className="text-[8px] opacity-80 text-[var(--text-color)]" style={{ '--text-color': branchColor } as React.CSSProperties}>{data.branchElement}</span>
                </div>
                {/* Branch Name */}
                <span className="text-[9px] text-zinc-600 dark:text-zinc-500">{data.branchName}</span>
                {/* 12 Unseong */}
                <div className="text-[9px] font-semibold text-zinc-200 mt-[2px] px-[6px] py-[2px] rounded bg-white/10">
                    {data.unseong}
                </div>
            </div>
        </div>
    );
}
