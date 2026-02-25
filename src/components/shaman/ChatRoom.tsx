
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSajuStore } from '@/lib/store';
import { SHAMANS, QUICK_QUESTIONS } from '@/lib/data/shamans';
import { ShamanSelector, MessageBubble } from './UIComponents';
import { Send, Sparkles, X, History, Trash2, Plus, ChevronLeft } from 'lucide-react';
import {
    ChatSession,
    ChatMessage,
    loadChatSessions,
    loadSession,
    saveSession,
    deleteSession,
} from '@/lib/chat-persistence';

interface ChatRoomProps {
    onClose: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatRoom({ onClose }: ChatRoomProps) {
    const { sajuData, user } = useSajuStore();
    const [currentShamanId, setCurrentShamanId] = useState(SHAMANS[0].id);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Persistence state
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const currentShaman = SHAMANS.find(s => s.id === currentShamanId) || SHAMANS[0];
    const isLoggedIn = !!user;

    // Load session list on mount for logged-in users
    useEffect(() => {
        if (isLoggedIn && user) {
            loadChatSessions(user.id).then(setSessions);
        }
    }, [isLoggedIn, user]);

    // Initial Greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: currentShaman.speechStyle.greeting
            }]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentShamanId]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Auto-save after messages change (debounced)
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const persistMessages = useCallback(async (msgs: Message[]) => {
        if (!isLoggedIn || !user || msgs.length <= 1) return;
        const id = await saveSession(user.id, currentShamanId, msgs as ChatMessage[], sessionId || undefined);
        if (id && !sessionId) {
            setSessionId(id);
        }
    }, [isLoggedIn, user, currentShamanId, sessionId]);

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
                    userSaju: sajuData,
                    chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
                    message: text
                })
            });

            const data = await res.json();
            if (data.reply) {
                const newMessages = [...messages, userMsg, { role: 'assistant' as const, content: data.reply }];
                setMessages(newMessages);

                // Auto-save for logged-in users
                if (isLoggedIn) {
                    clearTimeout(saveTimeout.current);
                    saveTimeout.current = setTimeout(() => persistMessages(newMessages), 1000);
                }
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

    const handleLoadSession = async (session: ChatSession) => {
        const loaded = await loadSession(session.id);
        if (loaded) {
            setSessionId(loaded.id);
            setCurrentShamanId(loaded.shaman_id);
            setMessages(loaded.messages as Message[]);
            setShowHistory(false);
        }
    };

    const handleDeleteSession = async (id: string) => {
        const ok = await deleteSession(id);
        if (ok) {
            setSessions(prev => prev.filter(s => s.id !== id));
            if (sessionId === id) {
                setSessionId(null);
                setMessages([{ role: 'assistant', content: currentShaman.speechStyle.greeting }]);
            }
        }
    };

    const handleNewChat = () => {
        setSessionId(null);
        setMessages([{ role: 'assistant', content: currentShaman.speechStyle.greeting }]);
        setShowHistory(false);
    };

    const getShamanName = (shamanId: string) => {
        return SHAMANS.find(s => s.id === shamanId)?.name || shamanId;
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
                <div className="flex items-center gap-2">
                    {isLoggedIn && (
                        <button
                            type="button"
                            onClick={() => { setShowHistory(!showHistory); if (!showHistory && user) loadChatSessions(user.id).then(setSessions); }}
                            aria-label="Chat history"
                            className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <History className="w-5 h-5 text-white/70" />
                        </button>
                    )}
                    <button type="button" onClick={onClose} aria-label="Close" className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {showHistory ? (
                    /* Session History Panel */
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 w-full max-w-md overflow-y-auto z-10"
                    >
                        <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={() => setShowHistory(false)}
                                    className="flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    돌아가기
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNewChat}
                                    className="flex items-center gap-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-full px-3 py-1.5 text-xs hover:bg-purple-600/30 transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                    새 대화
                                </button>
                            </div>

                            <h3 className="text-white/40 text-xs uppercase tracking-wider font-bold mb-3">이전 대화</h3>

                            {sessions.length === 0 ? (
                                <div className="text-center text-white/30 py-12 text-sm">
                                    저장된 대화가 없습니다.
                                </div>
                            ) : (
                                sessions.map((s) => (
                                    <div
                                        key={s.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                            sessionId === s.id
                                                ? 'bg-purple-900/20 border-purple-500/30'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        <div
                                            className="flex-1 min-w-0"
                                            onClick={() => handleLoadSession(s)}
                                        >
                                            <div className="text-sm text-white font-medium truncate">
                                                {getShamanName(s.shaman_id)}
                                            </div>
                                            <div className="text-xs text-white/40 truncate mt-0.5">
                                                {(s.messages as ChatMessage[]).filter(m => m.role === 'user').slice(-1)[0]?.content || '대화 시작됨'}
                                            </div>
                                            <div className="text-[10px] text-white/20 mt-1">
                                                {new Date(s.updated_at).toLocaleDateString('ko-KR')} · 메시지 {(s.messages as ChatMessage[]).length}개
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id); }}
                                            aria-label="Delete session"
                                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-white/20 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                ) : (
                    /* Chat View */
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 w-full max-w-md flex flex-col overflow-hidden z-10"
                    >
                        {/* Shaman Selector */}
                        <div className="w-full bg-black/20 pt-4">
                            <ShamanSelector
                                currentShamanId={currentShamanId}
                                onSelect={(id) => setCurrentShamanId(id)}
                            />
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide relative" ref={scrollRef}>
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
                        <div className="w-full px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
                            {QUICK_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSend(q.query)}
                                    className="flex-shrink-0 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white/80 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all flex items-center gap-2"
                                >
                                    <span>{q.emoji}</span>
                                    <span>{q.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="w-full p-4 bg-black/40 backdrop-blur-md border-t border-white/10 pb-8">
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
                                    type="button"
                                    onClick={() => handleSend(input)}
                                    disabled={isLoading || !input.trim()}
                                    aria-label="Send message"
                                    className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-white disabled:opacity-50 hover:bg-purple-500 transition-all"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
