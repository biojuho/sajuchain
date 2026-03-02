
'use client';

import React, { useRef, useEffect, useState } from 'react';

interface DateScrollPickerProps {
    year: number;
    month: number;
    day: number;
    onChange: (y: number, m: number, d: number) => void;
    labelYear?: string;
    labelMonth?: string;
    labelDay?: string;
}

const ITEM_HEIGHT = 40; // Height of each item in pixels

export const DateScrollPicker = ({ year, month, day, onChange, labelYear = '년', labelMonth = '월', labelDay = '일' }: DateScrollPickerProps) => {
    const years = Array.from({ length: 100 }, (_, i) => 2025 - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="relative flex gap-2 w-full h-[200px] bg-gray-900/40 rounded-3xl border border-white/5 overflow-hidden">
            {/* Highlight Bar - Moved to z-0 so it is behind text */ }
            <div className="absolute top-1/2 left-0 w-full h-[40px] -translate-y-1/2 bg-white/10 border-y border-white/20 pointer-events-none z-0 backdrop-blur-[1px]" />
            
            {/* Gradients - z-20 is fine as long as text is z-10? No, text needs to be on top.
                Let's make text z-10. Gradients z-20.
                Wait, if gradients are z-20 and full opacity black at ends, that's good.
                But the middle should be transparent.
            */}
            <div className="absolute top-0 left-0 w-full h-[80px] bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />

            {/* Columns */}
            <ScrollColumn 
                items={years} 
                value={year} 
                onChange={(y) => onChange(y, month, day)} 
                label={labelYear} 
            />
            <ScrollColumn 
                items={months} 
                value={month} 
                onChange={(m) => onChange(year, m, day)} 
                label={labelMonth} 
            />
            <ScrollColumn 
                items={days} 
                value={day} 
                onChange={(d) => onChange(year, month, d)} 
                label={labelDay} 
            />
        </div>
    );
};

interface ScrollColumnProps {
    items: number[];
    value: number;
    onChange: (val: number) => void;
    label: string;
}

const ScrollColumn = ({ items, value, onChange, label }: ScrollColumnProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [internalValue, setInternalValue] = useState(value);

    // Sync initial scroll and external value changes
    useEffect(() => {
        if (containerRef.current) {
            const index = items.indexOf(value);
            if (index !== -1) {
                containerRef.current.scrollTop = index * ITEM_HEIGHT;
            }
        }
        setInternalValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, items]);

    const handleScroll = () => {
        if (!containerRef.current) return;
        
        setIsScrolling(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const scrollTop = containerRef.current.scrollTop;
        const index = Math.round(scrollTop / ITEM_HEIGHT);
        
        // Immediate visual update!
        if (items[index] !== undefined && items[index] !== internalValue) {
             setInternalValue(items[index]);
        }
        
        // Debounce value update to avoid excessive re-renders during scroll
        // Increased from 150ms to 300ms to reduce sensitivity during fast swipes
        timeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
            if (items[index] !== undefined && items[index] !== value) {
                onChange(items[index]);
                // Note: We removed the manual JS scrollTo({ behavior: 'smooth' }) here.
                // The CSS scroll-snap (snap-y snap-mandatory) naturally handles alignment 
                // much more smoothly without fighting the user's touch velocity.
            }
        }, 300);
    };

    return (
        <div className="flex-1 relative h-full">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 text-[10px] text-white/30 font-bold">
                {label}
            </div>
            <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide py-[80px] relative z-0"
                style={{ scrollBehavior: isScrolling ? 'auto' : 'smooth' }}
            >
                {items.map((item) => (
                    <div 
                        key={item} 
                        className={`h-[40px] flex items-center justify-center snap-center transition-all duration-200 ${item === internalValue ? 'text-white font-bold text-2xl scale-110' : 'text-white/20 text-base'}`}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};
