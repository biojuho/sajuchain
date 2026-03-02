'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Moon, Heart, MessageCircle, User } from 'lucide-react';

const TABS = [
    { key: 'home', label: '홈', icon: Home, path: '/' },
    { key: 'tojeong', label: '토정비결', icon: Moon, path: '/tojeong' },
    { key: 'compatibility', label: '궁합', icon: Heart, path: '/compatibility' },
    { key: 'chat', label: '채팅', icon: MessageCircle, path: '/chat' },
    { key: 'profile', label: '마이', icon: User, path: '/profile' },
] as const;

const HIDDEN_ROUTES = ['/auth', '/admin', '/mint', '/payment', '/chat'];

export default function BottomTabBar() {
    const pathname = usePathname();
    const router = useRouter();

    const shouldHide = useMemo(
        () => HIDDEN_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/')),
        [pathname],
    );

    const activeKey = useMemo(
        () => TABS.find((t) => {
            if (t.path === '/') return pathname === '/';
            return pathname.startsWith(t.path);
        })?.key,
        [pathname],
    );

    const handleTabPress = useCallback(
        (path: string) => router.push(path),
        [router],
    );

    if (shouldHide) return null;

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
            <div className="bg-zinc-950/90 backdrop-blur-xl border-t border-white/10 px-2 pb-[env(safe-area-inset-bottom)]">
                <div className="flex justify-around items-center h-14">
                    {TABS.map((tab) => {
                        const isActive = tab.key === activeKey;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleTabPress(tab.path)}
                                className="flex flex-col items-center justify-center flex-1 h-full relative"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="tab-indicator"
                                        className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-500 rounded-full"
                                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                )}
                                <Icon
                                    className={`w-5 h-5 transition-colors ${
                                        isActive ? 'text-purple-400' : 'text-zinc-500'
                                    }`}
                                />
                                <span
                                    className={`text-[10px] mt-0.5 transition-colors ${
                                        isActive ? 'text-purple-400 font-medium' : 'text-zinc-500'
                                    }`}
                                >
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
