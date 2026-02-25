'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CrystalCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
}

export const CrystalCard = ({ children, className, ...props }: CrystalCardProps) => {
    return (
        <motion.div
            className={cn(
                "relative backdrop-blur-[40px] bg-white/[0.02] border border-white/[0.08] rounded-[32px] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] overflow-hidden",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/[0.05] before:to-transparent before:pointer-events-none",
                "after:absolute after:inset-0 after:bg-gradient-to-tl after:from-purple-500/[0.03] after:to-transparent after:pointer-events-none",
                className
            )}
            {...props}
        >
            {/* Edge Shine Effect */}
            <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
