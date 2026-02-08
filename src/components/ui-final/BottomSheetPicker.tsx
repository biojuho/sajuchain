
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetPickerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    options: number[];
    value: number;
    onChange: (val: number) => void;
    formatter?: (val: number) => string;
}

export const BottomSheetPicker = ({ isOpen, onClose, title, options, value, onChange, formatter }: BottomSheetPickerProps) => {
    const listRef = useRef<HTMLUListElement>(null);
    const [tempValue, setTempValue] = useState(value);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync tempValue when opening
    useEffect(() => {
        if (isOpen) {
            setTempValue(value);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, value]);

    // Auto-scroll to selected
    useEffect(() => {
        if (isOpen && listRef.current) {
            const selectedEl = listRef.current.querySelector('[data-selected="true"]');
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'center' });
            }
        }
    }, [isOpen]);

    const handleConfirm = () => {
        onChange(tempValue);
        onClose();
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[9998]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[9999] bg-zinc-900 rounded-t-[24px] overflow-hidden max-h-[55vh] flex flex-col shadow-2xl"
                    >
                        {/* Drag Handle */}
                        <div className="w-full pt-3 pb-1 flex justify-center flex-shrink-0 bg-zinc-900">
                            <div className="w-10 h-1 bg-zinc-700 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex justify-between items-center px-5 pb-3 pt-1 border-b border-white/5 flex-shrink-0 bg-zinc-900">
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 font-bold text-[15px] text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                완료
                            </button>
                        </div>

                        {/* Picker Body */}
                        <div className="relative flex-1 bg-zinc-900 overflow-hidden w-full">
                            <ul
                                ref={listRef}
                                className="h-full overflow-y-auto w-full py-[calc(50%-26px)] text-center relative z-10 scrollbar-hide overscroll-contain"
                            >
                                {options.map((opt) => {
                                    const isSelected = opt === tempValue;
                                    return (
                                        <li
                                            key={opt}
                                            data-selected={isSelected}
                                            onClick={() => setTempValue(opt)}
                                            className={`h-[52px] flex items-center justify-center cursor-pointer transition-all duration-150 ${isSelected
                                                    ? 'text-white font-bold text-[22px] bg-purple-500/10 border-l-[3px] border-purple-500'
                                                    : 'text-zinc-400 text-[18px] hover:bg-white/5'
                                                }`}
                                        >
                                            {formatter ? formatter(opt) : opt}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Safe Area */}
                        <div className="bg-zinc-900 h-[env(safe-area-inset-bottom,20px)] flex-shrink-0" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
