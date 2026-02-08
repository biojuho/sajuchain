'use client';

import { useRouter } from 'next/navigation';
import ChatRoom from '@/components/shaman/ChatRoom';

export default function ChatPage() {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-black">
            <ChatRoom onClose={handleClose} />
        </div>
    );
}
