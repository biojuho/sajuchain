
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProcessIndicatorProps {
    totalSteps: number;
    currentStep: number; // 0-indexed or 1-based? Let's say 1-based for display logic
    completedSteps: number; // How many verified complete
}

export const ProcessIndicator = ({ totalSteps = 4, currentStep, completedSteps }: ProcessIndicatorProps) => {
    return (
        <div className="flex gap-1 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => {
                const stepNum = i + 1;
                const isCompleted = stepNum <= completedSteps;
                const isCurrent = stepNum === currentStep;

                return (
                    <div key={i} className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={false}
                            animate={{
                                width: isCompleted ? '100%' : '0%',
                                opacity: isCompleted || isCurrent ? 1 : 0
                            }}
                            className={`h-full ${isCurrent ? 'bg-purple-400 animate-pulse' : 'bg-purple-600'}`}
                        />
                    </div>
                );
            })}
        </div>
    );
}
