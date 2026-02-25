'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        const supabase = createClient();
        if (!supabase) {
            alert("로그인 서비스를 이용할 수 없습니다 (서버 설정 오류).");
            setLoading(false);
            return;
        }

        const next = searchParams.get('next') || '/';
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            },
        });
        if (error) {
            alert(error.message);
            setLoading(false);
        }
    };

    const handleGuest = () => {
        router.push('/');
    };

    return (
        <div style={{
            minHeight: "100vh", background: "#09090b", color: "#fafafa",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 20, position: "relative", overflow: "hidden"
        }}>
            {/* Background Effects */}
            <div style={{
                position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
                width: 300, height: 300, background: "rgba(168,85,247,0.2)",
                filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none"
            }} />

            <div style={{ zIndex: 1, width: "100%", maxWidth: 360, textAlign: "center" }}>
                {/* Logo / Icon */}
                <div style={{
                    width: 72, height: 72, margin: "0 auto 24px",
                    background: "linear-gradient(135deg, #2e1065, #1e1b4b)",
                    borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32, boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
                }}>
                    🔮
                </div>

                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                    사주체인 시작하기
                </h1>
                <p style={{ fontSize: 14, color: "#a1a1aa", marginBottom: 40, lineHeight: 1.6 }}>
                    나의 운명을 영구히 기록하고,<br />
                    소중한 인연들과 연결되세요.
                </p>

                {/* Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{
                            width: "100%", height: 52, borderRadius: 16,
                            background: "#fff", color: "#000",
                            border: "none", fontSize: 15, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                            cursor: "pointer", opacity: loading ? 0.7 : 1, transition: "transform 0.1s active"
                        }}
                    >
                        {/* Google Icon SVG */}
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google로 계속하기
                    </button>

                    <button
                        onClick={handleGuest}
                        style={{
                            width: "100%", height: 52, borderRadius: 16,
                            background: "rgba(255,255,255,0.05)", color: "#a1a1aa",
                            border: "1px solid rgba(255,255,255,0.05)",
                            fontSize: 14, fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        게스트로 둘러보기
                    </button>
                </div>

                <div style={{ marginTop: 32, fontSize: 12, color: "#52525b" }}>
                    로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh", background: "#09090b" }} />}>
            <AuthContent />
        </Suspense>
    );
}
