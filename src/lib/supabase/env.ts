type PublicSupabaseEnv = {
    url: string;
    key: string;
};

function isPlaceholder(value: string): boolean {
    const normalized = value.trim().toLowerCase();

    return (
        normalized.length === 0 ||
        normalized.includes("your-") ||
        normalized.includes("placeholder") ||
        normalized.endsWith("-here")
    );
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

    if (!url || !key) return null;
    if (isPlaceholder(url) || isPlaceholder(key)) return null;
    if (!url.startsWith("http")) return null;
    if (key.toLowerCase().includes("service_role")) return null;

    return { url, key };
}
