'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MysticalButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MysticalButton = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className, 
    ...props 
}: MysticalButtonProps) => {
  const variants = {
    primary: "bg-gradient-to-r from-mystic-600 to-indigo-600 text-white shadow-lg shadow-mystic-500/20 border border-white/10",
    secondary: "bg-white/10 text-white backdrop-blur-md border border-white/10 hover:bg-white/20",
    outline: "bg-transparent border border-mystic-500/50 text-mystic-200 hover:bg-mystic-500/10"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg font-bold"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative rounded-full font-medium transition-all duration-300 isolate overflow-hidden",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
        {/* Shimmer effect for primary button */}
        {variant === 'primary' && (
            <div className="absolute inset-0 -translate-x-[100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        )}
      {children}
    </motion.button>
  );
};
