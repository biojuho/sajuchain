
import React from 'react';
import { SHAMANS } from '@/lib/data/shamans';
import { motion } from 'framer-motion';

interface ShamanSelectorProps {
    currentShamanId: string;
    onSelect: (id: string) => void;
}

export function ShamanSelector({ currentShamanId, onSelect }: ShamanSelectorProps) {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-4">
            {SHAMANS.map((shaman) => {
                const isSelected = currentShamanId === shaman.id;
                return (
                    <motion.button
                        key={shaman.id}
                        onClick={() => onSelect(shaman.id)}
                        whileTap={{ scale: 0.95 }}
                        className={`relative flex-shrink-0 w-32 h-40 rounded-2xl overflow-hidden border-2 transition-all flex flex-col items-center justify-end p-4 gap-2 ${isSelected
                                ? 'border-purple-400 ring-2 ring-purple-500/50 bg-purple-900/40'
                                : 'border-white/10 bg-white/5 opacity-70 hover:opacity-100'
                            }`}
                    >
                        <div className="absolute top-2 right-2 text-2xl filter drop-shadow-md">
                            {shaman.emoji}
                        </div>
                        <div className="text-4xl filter drop-shadow-2xl grayscale transition-all duration-500" style={{ filter: isSelected ? 'grayscale(0%)' : 'grayscale(100%)' }}>
                            {/* In real app, we use Image component. For now using emoji as avatar placeholder if needed or just text */}
                            <span className="text-4xl">{shaman.emoji}</span>
                        </div>
                        <div className="text-center z-10">
                            <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-white/70'}`}>{shaman.name}</p>
                            <p className="text-[10px] text-white/40 line-clamp-1">{shaman.personality.split('.')[0]}</p>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    shamanId?: string;
}

export function MessageBubble({ role, content, shamanId }: MessageBubbleProps) {
    const isUser = role === 'user';
    const shaman = SHAMANS.find(s => s.id === shamanId);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`max-w-[85%] rounded-2xl p-4 relative ${isUser
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'
                }`}>
                {!isUser && shaman && (
                    <div className="absolute -top-6 left-0 text-xs text-white/50 flex items-center gap-1">
                        <span>{shaman.emoji}</span>
                        <span>{shaman.name}</span>
                    </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed">
                    {content.split('📖').map((part, i) => {
                        if (i === 0) return part;
                        // Rendering quote style
                        const [quote, ...rest] = part.split('\n');
                        return (
                            <React.Fragment key={i}>
                                <div className="my-2 pl-3 border-l-2 border-yellow-500/50 italic text-yellow-100/90 text-sm bg-yellow-900/10 p-2 rounded-r">
                                    📖 {quote}
                                </div>
                                {rest.join('\n')}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
