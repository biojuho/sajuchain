'use client';

import React from 'react';

export const SageAdviceCard = ({ advice }: { advice: string }) => {
    return (
        <section className="mx-5 mb-6 relative">
            <div
                className="relative rounded-[18px] p-[22px_18px] text-center overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, rgba(168,85,247,0.06), rgba(59,130,246,0.04))",
                    border: "1px solid rgba(168,85,247,0.12)"
                }}
            >
                <div className="absolute top-2 left-3.5 text-[48px] text-[rgba(168,85,247,0.08)] leading-none select-none font-serif">"</div>

                <p className="text-[11px] text-zinc-500 mb-2 relative z-10 font-medium">🔮 도사님의 한마디</p>
                <p className="text-[15px] text-zinc-200 italic leading-[1.7] m-0 relative z-10 font-medium whitespace-pre-wrap">
                    "{advice}"
                </p>
            </div>
        </section>
    );
};
