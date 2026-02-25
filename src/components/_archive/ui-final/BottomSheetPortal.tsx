'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetPortalProps<T> {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: { value: T; label: string }[];
    selectedValue: T;
    onConfirm: (value: T) => void;
    formatter?: (value: T) => string;
}

export function BottomSheetPortal<T extends number | string>({
    isOpen,
    onClose,
    title,
    items,
    selectedValue,
    onConfirm,
}: BottomSheetPortalProps<T>) {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const [tempValue, setTempValue] = useState<T>(selectedValue);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTempValue(selectedValue);
            requestAnimationFrame(() => setVisible(true));
            document.body.style.overflow = "hidden";
        } else {
            setVisible(false);
            document.body.style.overflow = "";
        }
    }, [isOpen, selectedValue]);

    // Auto-scroll to selected
    useEffect(() => {
        if (visible && listRef.current) {
            const el = listRef.current.querySelector('[data-sel="true"]');
            if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
        }
    }, [visible]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 250);
    };

    const handleConfirm = () => {
        setVisible(false);
        setTimeout(() => {
            onConfirm(tempValue);
        }, 250);
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1000] font-sans">
            {/* Overlay */}
            <div
                onClick={handleClose}
                className={`absolute inset-0 bg-black/60 backdrop-blur-[4px] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            {/* Sheet */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-[#18181b] rounded-t-[20px] max-h-[55vh] flex flex-col transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)] ${visible ? 'translate-y-0' : 'translate-y-full'
                    }`}
            >
                {/* Handle */}
                <div className="w-9 h-1 bg-zinc-700 rounded-full mx-auto mt-3 mb-0" />

                {/* Header */}
                <div className="flex justify-between items-center px-5 pt-3 pb-2.5 border-b border-white/5 flex-shrink-0">
                    <span className="text-[17px] font-bold text-[#fafafa]">{title}</span>
                    <button
                        onClick={handleConfirm}
                        className="bg-transparent border-none text-purple-500 text-[15px] font-bold cursor-pointer py-2 px-3 min-h-[44px] hover:text-purple-400 transition-colors"
                    >
                        완료
                    </button>
                </div>

                {/* List */}
                <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto overscroll-contain py-1 scrollbar-hide"
                    style={{ WebkitOverflowScrolling: "touch" }}
                >
                    {items.map((item) => {
                        const isSelected = tempValue === item.value;
                        return (
                            <div
                                key={String(item.value)}
                                data-sel={isSelected ? "true" : "false"}
                                onClick={() => setTempValue(item.value)}
                                className={`h-12 flex items-center justify-center cursor-pointer transition-all duration-150 ${isSelected
                                        ? 'bg-purple-500/10 border-l-[3px] border-l-purple-500 text-white font-bold text-[20px]'
                                        : 'bg-transparent border-l-[3px] border-l-transparent text-zinc-500 font-normal text-[16px]'
                                    }`}
                            >
                                {item.label}
                            </div>
                        );
                    })}
                </div>
                <div className="h-5 flex-shrink-0" /> {/* Bottom safe area spacer */}
            </div>
        </div>,
        document.body
    );
}
