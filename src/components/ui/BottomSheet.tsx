
import React, { useState, useEffect, useRef } from "react";
import { getDaysInMonth } from "@/lib/utils";

interface BottomSheetProps {
    type: "year" | "month" | "day";
    currentValue: number;
    year: number;
    month: number;
    onConfirm: (val: number) => void;
    onClose: () => void;
}

export function BottomSheet({ type, currentValue, onConfirm, onClose, year, month }: BottomSheetProps) {
    const [temp, setTemp] = useState(currentValue);
    const listRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    const items = (() => {
        if (type === "year") return Array.from({ length: 106 }, (_, i) => ({ v: 2025 - i, l: `${2025 - i}년` }));
        if (type === "month") return Array.from({ length: 12 }, (_, i) => ({ v: i + 1, l: `${i + 1}월` }));
        if (type === "day") { const max = getDaysInMonth(year, month); return Array.from({ length: max }, (_, i) => ({ v: i + 1, l: `${i + 1}일` })); }
        return [];
    })();

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    useEffect(() => {
        if (visible && listRef.current) {
            const el = listRef.current.querySelector('[data-sel="true"]');
            if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
        }
    }, [visible]);

    const close = () => { setVisible(false); setTimeout(onClose, 250); };
    const confirm = () => { setVisible(false); setTimeout(() => onConfirm(temp), 250); };

    const title = type === "year" ? "연도 선택" : type === "month" ? "월 선택" : "일 선택";

    return (
        <div className="fixed inset-0 z-[1000]">
            {/* overlay */}
            <div 
                onClick={close} 
                className={`absolute inset-0 bg-black/60 backdrop-blur-[4px] transition-opacity duration-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* sheet */}
            <div 
                className={`absolute bottom-0 left-0 right-0 bg-[#18181b] rounded-t-[20px] max-h-[50vh] flex flex-col transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)] ${visible ? 'translate-y-0' : 'translate-y-full'}`}
            >
                {/* handle */}
                <div className="w-9 h-1 bg-zinc-700 rounded-sm mx-auto mt-[10px]" />
                {/* header */}
                <div className="flex justify-between items-center px-5 pt-[14px] pb-[10px] border-b border-white/5 shrink-0">
                    <span className="text-[17px] font-bold text-zinc-50">{title}</span>
                    <button 
                        onClick={confirm} 
                        className="bg-none border-none text-purple-500 text-[15px] font-bold cursor-pointer px-3 py-2 min-h-[44px]"
                    >
                        완료
                    </button>
                </div>
                {/* list */}
                <div 
                    ref={listRef} 
                    className="flex-1 overflow-y-auto overscroll-contain py-1"
                >
                    {items.map(it => (
                        <div 
                            key={it.v} 
                            data-sel={temp === it.v ? "true" : "false"} 
                            onClick={() => setTemp(it.v)}
                            className={`h-12 flex items-center justify-center cursor-pointer transition-all duration-150 border-l-[3px] ${
                                temp === it.v 
                                ? "text-xl font-bold text-white bg-purple-500/10 border-purple-500" 
                                : "text-base font-normal text-zinc-400 bg-transparent border-transparent"
                            }`}
                        >
                            {it.l}
                        </div>
                    ))}
                </div>
                <div className="h-5 shrink-0" />
            </div>
        </div>
    );
}
