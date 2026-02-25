'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KineticHeadingProps {
    text: string;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
    delay?: number;
}

export const KineticHeading = ({ text, className, delay = 0 }: KineticHeadingProps) => {
    const characters = text.split("");

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.04 * i + delay },
        }),
    };

    const childVariants: Variants = {
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            style={{ display: 'inline-block', overflow: 'hidden' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn("font-bold tracking-tight", className)}
        >
            {characters.map((char, index) => (
                <motion.span 
                    key={index} 
                    variants={childVariants} 
                    style={{ display: 'inline-block' }}
                    className={char === " " ? "mr-1" : ""}
                >
                    {char}
                </motion.span>
            ))}
        </motion.div>
    );
};
