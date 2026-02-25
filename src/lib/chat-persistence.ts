import { createClient } from '@/lib/supabase/client';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatSession {
    id: string;
    shaman_id: string;
    messages: ChatMessage[];
    created_at: string;
    updated_at: string;
}

export async function loadChatSessions(userId: string): Promise<ChatSession[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, shaman_id, messages, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Failed to load chat sessions:', error);
        return [];
    }

    return (data || []) as ChatSession[];
}

export async function loadSession(sessionId: string): Promise<ChatSession | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, shaman_id, messages, created_at, updated_at')
        .eq('id', sessionId)
        .single();

    if (error) {
        console.error('Failed to load session:', error);
        return null;
    }

    return data as ChatSession;
}

export async function saveSession(
    userId: string,
    shamanId: string,
    messages: ChatMessage[],
    sessionId?: string
): Promise<string | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const trimmed = messages.slice(-50);

    if (sessionId) {
        const { error } = await supabase
            .from('chat_sessions')
            .update({
                messages: trimmed,
                shaman_id: shamanId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);

        if (error) {
            console.error('Failed to update session:', error);
            return null;
        }
        return sessionId;
    }

    const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
            user_id: userId,
            shaman_id: shamanId,
            messages: trimmed,
        })
        .select('id')
        .single();

    if (error) {
        console.error('Failed to create session:', error);
        return null;
    }

    return data?.id || null;
}

export async function deleteSession(sessionId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

    if (error) {
        console.error('Failed to delete session:', error);
        return false;
    }

    return true;
}
