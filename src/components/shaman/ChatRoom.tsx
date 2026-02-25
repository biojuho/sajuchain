
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSajuStore } from '@/lib/store';
import { SHAMANS, QUICK_QUESTIONS } from '@/lib/data/shamans';
import { ShamanSelector, MessageBubble } from './UIComponents';
import { Send, Sparkles, X } from 'lucide-react';

interface ChatRoomProps {
    onClose: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatRoom({ onClose }: ChatRoomProps) {
    const { sajuData } = useSajuStore();
    const [currentShamanId, setCurrentShamanId] = useState(SHAMANS[0].id);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const currentShaman = SHAMANS.find(s => s.id === currentShamanId)!;

    // Initial Greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: currentShaman.speechStyle.greeting
            }]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentShamanId]); // Only reset if empty? No, switching shaman should probably announce themselves?
    // For now, let's keep history but maybe add a system note or just simple switch.

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shamanId: currentShamanId,
                    userSaju: sajuData, // Assuming store has it
                    chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
                    message: text
                })
            });

            const data = await res.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                throw new Error(data.error || 'Failed');
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: '죄송합니다. 기운이 흐트러져 응답할 수 없습니다. 잠시 후 다시 시도해주세요.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col h-full items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0a0a] to-[#0a0a0a]" />
            </div>

            {/* Header */}
            <div className="w-full max-w-md bg-black/40 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-yellow-400 w-5 h-5" />
                    <span className="font-bold text-lg text-white">AI 점술가</span>
                </div>
                <button onClick={onClose} aria-label="Close" className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Shaman Selector */}
            <div className="w-full max-w-md bg-black/20 pt-4 z-10">
                <ShamanSelector
                    currentShamanId={currentShamanId}
                    onSelect={(id) => setCurrentShamanId(id)}
                />
            </div>

            {/* Chat Area */}
            <div className="flex-1 w-full max-w-md overflow-y-auto p-4 scrollbar-hide relative" ref={scrollRef}>
                {messages.map((msg, i) => (
                    <MessageBubble key={i} role={msg.role} content={msg.content} shamanId={msg.role === 'assistant' ? currentShamanId : undefined} />
                ))}

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start mb-4"
                    >
                        <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
                            <span className="text-2xl animate-spin">🔮</span>
                            <span className="text-sm text-white/60">점괘를 살피는 중...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="w-full max-w-md px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {QUICK_QUESTIONS.map((q, i) => (
                    <button
                        key={i}
                        onClick={() => handleSend(q.query)}
                        className="flex-shrink-0 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white/80 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all flex items-center gap-2"
                    >
                        <span>{q.emoji}</span>
                        <span>{q.label}</span>
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="w-full max-w-md p-4 bg-black/40 backdrop-blur-md border-t border-white/10 pb-8">
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                        placeholder={`${currentShaman.name}님에게 물어보세요...`}
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                    <button
                        onClick={() => handleSend(input)}
                        disabled={isLoading || !input.trim()}
                        aria-label="Send message"
                        className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-white disabled:opacity-50 hover:bg-purple-500 transition-all"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
