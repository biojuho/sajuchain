
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    intensity?: 'low' | 'medium' | 'high';
}

export const GlassCard = ({ children, className, intensity = 'medium', ...props }: GlassCardProps) => {
    const bgOpacity = {
        low: 'bg-white/[0.03]',
        medium: 'bg-white/[0.05]',
        high: 'bg-white/[0.08]',
    };

    const borderOpacity = {
        low: 'border-white/[0.05]',
        medium: 'border-white/[0.1]',
        high: 'border-white/[0.15]',
    };

    return (
        <motion.div
            className={cn(
                'backdrop-blur-xl rounded-3xl border shadow-xl',
                bgOpacity[intensity],
                borderOpacity[intensity],
                className
            )}
            {...props}
        >
            {/* Inner glow/noise if desired */}
            {children}
        </motion.div>
    );
};
