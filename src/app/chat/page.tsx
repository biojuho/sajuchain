'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import ChatRoom from '@/components/shaman/ChatRoom';

export default function ChatPage() {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-black">
            <Suspense fallback={<div className="min-h-screen bg-black text-zinc-200 flex items-center justify-center">채팅을 불러오는 중입니다...</div>}>
                <ChatRoom onClose={handleClose} />
            </Suspense>
        </div>
    );
}
