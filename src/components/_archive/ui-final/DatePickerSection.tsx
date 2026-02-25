'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface DatePickerSectionProps {
    year: number;
    month: number;
    day: number;
    onChange: (y: number, m: number, d: number) => void;
}

export const DatePickerSection = ({ year, month, day, onChange }: DatePickerSectionProps) => {
    // State for Bottom Sheet
    const [sheet, setSheet] = useState<{ open: boolean; type: 'year' | 'month' | 'day' | null }>({
        open: false,
        type: null
    });
    const [tempVal, setTempVal] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    // Handle hydration for Portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Open Sheet
    const openSheet = (type: 'year' | 'month' | 'day') => {
        const currentVal = type === 'year' ? year : type === 'month' ? month : day;
        setTempVal(currentVal);
        setSheet({ open: true, type });
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    // Close Sheet
    const closeSheet = () => {
        setSheet({ open: false, type: null });
        setTempVal(null);
        document.body.style.overflow = '';
    };

    // Confirm Selection
    const confirmSheet = () => {
        if (sheet.type && tempVal !== null) {
            if (sheet.type === 'year') onChange(tempVal, month, day);
            if (sheet.type === 'month') onChange(year, tempVal, day);
            if (sheet.type === 'day') onChange(year, month, tempVal);
        }
        closeSheet();
    };

    // Data Generators
    const getSheetItems = (type: 'year' | 'month' | 'day' | null) => {
        if (type === 'year') {
            return Array.from({ length: 2026 - 1920 }, (_, i) => {
                const y = 2025 - i;
                return { value: y, label: `${y}년` };
            });
        }
        if (type === 'month') {
            return Array.from({ length: 12 }, (_, i) => ({
                value: i + 1,
                label: `${i + 1}월`
            }));
        }
        if (type === 'day') {
            const maxDay = new Date(year, month, 0).getDate();
            return Array.from({ length: maxDay }, (_, i) => ({
                value: i + 1,
                label: `${i + 1}일`
            }));
        }
        return [];
    };

    const items = useMemo(() => getSheetItems(sheet.type), [sheet.type, year, month]);

    // Auto-scroll to selected item
    useEffect(() => {
        if (sheet.open) {
            const timer = setTimeout(() => {
                const list = document.getElementById('sheet-list');
                if (list) {
                    const selected = list.querySelector('[data-selected="true"]');
                    if (selected) {
                        selected.scrollIntoView({ block: 'center', behavior: 'instant' });
                    }
                }
            }, 100); // Slight delay for render
            return () => clearTimeout(timer);
        }
    }, [sheet.open]);

    // Styling Helpers - matching the user's "Dark Balance" request
    const getCardStyle = (type: 'year' | 'month' | 'day') => {
        const isActive = sheet.open && sheet.type === type;
        return `relative flex flex-col justify-between h-[68px] bg-zinc-800 rounded-2xl p-[14px] cursor-pointer transition-all ${isActive
                ? 'border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                : 'border border-white/5 hover:bg-zinc-700/80 hover:border-white/10'
            }`;
    };

    return (
        <>
            <div className="flex gap-2.5 w-full">
                {/* YEAR CARD */}
                <div
                    onClick={() => openSheet('year')}
                    className={getCardStyle('year')}
                    style={{ flex: 1.4 }}
                >
                    <span className={`text-[11px] font-medium transition-colors ${sheet.type === 'year' ? 'text-purple-400' : 'text-zinc-500'}`}>년</span>
                    <div className="flex justify-between items-end w-full">
                        <span className="text-[24px] font-bold text-zinc-50 leading-none tracking-tight">{year}</span>
                        <ChevronDown className={`w-3.5 h-3.5 mb-0.5 transition-colors ${sheet.type === 'year' ? 'text-purple-500' : 'text-zinc-600'}`} />
                    </div>
                </div>

                {/* MONTH CARD */}
                <div
                    onClick={() => openSheet('month')}
                    className={getCardStyle('month')}
                    style={{ flex: 1 }}
                >
                    <span className={`text-[11px] font-medium transition-colors ${sheet.type === 'month' ? 'text-purple-400' : 'text-zinc-500'}`}>월</span>
                    <div className="flex justify-between items-end w-full">
                        <span className="text-[24px] font-bold text-zinc-50 leading-none tracking-tight">{month}</span>
                        <ChevronDown className={`w-3.5 h-3.5 mb-0.5 transition-colors ${sheet.type === 'month' ? 'text-purple-500' : 'text-zinc-600'}`} />
                    </div>
                </div>

                {/* DAY CARD */}
                <div
                    onClick={() => openSheet('day')}
                    className={getCardStyle('day')}
                    style={{ flex: 1 }}
                >
                    <span className={`text-[11px] font-medium transition-colors ${sheet.type === 'day' ? 'text-purple-400' : 'text-zinc-500'}`}>일</span>
                    <div className="flex justify-between items-end w-full">
                        <span className="text-[24px] font-bold text-zinc-50 leading-none tracking-tight">{day}</span>
                        <ChevronDown className={`w-3.5 h-3.5 mb-0.5 transition-colors ${sheet.type === 'day' ? 'text-purple-500' : 'text-zinc-600'}`} />
                    </div>
                </div>
            </div>

            {/* PORTAL FOR BOTTOM SHEET - Ensures it renders outside any transform context */}
            {mounted && sheet.open && createPortal(
                <div className="fixed inset-0 z-[9999] isolate font-sans">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSheet}
                        className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[100]"
                    />

                    {/* Bottom Sheet Panel */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-[#18181b] rounded-t-[24px] max-h-[55vh] flex flex-col z-[101] shadow-2xl border-t border-white/10"
                    >
                        {/* Handle */}
                        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-3 mb-1" />

                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 flex-shrink-0">
                            <span className="text-[18px] font-bold text-zinc-50">
                                {sheet.type === 'year' ? '연도 선택' : sheet.type === 'month' ? '월 선택' : '태어난 일 선택'}
                            </span>
                            <button
                                onClick={confirmSheet}
                                className="text-[15px] font-bold text-purple-500 hover:text-purple-400 transition-colors px-2 py-1"
                            >
                                완료
                            </button>
                        </div>

                        {/* Scroll List */}
                        <div
                            id="sheet-list"
                            className="flex-1 overflow-y-auto overscroll-contain py-2 scrollbar-hide"
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            {items.map((item) => (
                                <div
                                    key={item.value}
                                    data-selected={tempVal === item.value ? "true" : "false"}
                                    onClick={() => setTempVal(item.value)}
                                    className={`h-[52px] flex items-center justify-center cursor-pointer transition-all ${tempVal === item.value
                                            ? 'bg-purple-500/10 border-l-[3px] border-l-purple-500 text-white font-bold text-[22px]'
                                            : 'text-zinc-400 font-normal text-[18px] border-l-[3px] border-l-transparent'
                                        }`}
                                >
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </>
    );
};
