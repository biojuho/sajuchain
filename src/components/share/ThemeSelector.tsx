
import React from 'react';
import { THEMES, ShareTheme } from './ShareCard';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
    currentTheme: ShareTheme;
    onSelect: (theme: ShareTheme) => void;
}

export default function ThemeSelector({ currentTheme, onSelect }: ThemeSelectorProps) {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {(Object.keys(THEMES) as ShareTheme[]).map((theme) => {
                const style = THEMES[theme];
                const isSelected = currentTheme === theme;

                return (
                    <motion.button
                        key={theme}
                        onClick={() => onSelect(theme)}
                        whileTap={{ scale: 0.95 }}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${isSelected ? 'border-white ring-2 ring-purple-500 ring-offset-2 ring-offset-black' : 'border-white/20 opacity-60 hover:opacity-100'
                            }`}
                    >
                        <div className={`absolute inset-0 ${style.bg}`} />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            {style.decor.split(' ')[1]}
                        </div>
                        {isSelected && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Check className="w-8 h-8 text-white" />
                            </div>
                        )}
                        <span className="absolute bottom-1 left-0 right-0 text-[10px] text-center text-white/80 font-bold uppercase tracking-wider shadow-black drop-shadow-md">
                            {theme}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
