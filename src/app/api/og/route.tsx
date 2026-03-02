import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// cspell:ignore Ohaeng Pretendard Csvg Crect saju SAJUCHAIN

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Data Params
        const type = searchParams.get('type') || 'og'; // 'og' | 'card'
        const name = searchParams.get('name') || 'Guest';
        const birthdate = searchParams.get('birthdate') || 'Fate';
        const dayMaster = searchParams.get('dayMaster') || '✨';
        const dayMasterElement = searchParams.get('dayMasterElement') || 'Destiny';
        const keywordsParam = searchParams.get('keywords');
        const keywords = keywordsParam ? keywordsParam.split(',').slice(0, 3) : ['Mystic', 'Fortune', 'Journey'];
        const desc = searchParams.get('desc') || 'Your personalized reading awaits.';

        // Colors mapping based on Ohaeng (Five Elements)
        const map: Record<string, string> = { 
            '목': '#22c55e', // Green
            '화': '#ef4444', // Red
            '토': '#eab308', // Yellow
            '금': '#cbd5e1', // White/Silver
            '수': '#3b82f6'  // Blue
        };
        const accentColor = map[dayMasterElement] || '#a855f7'; // Purple fallback

        const STYLES = {
            container: {
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000000',
                fontFamily: 'Inter, "Pretendard", sans-serif',
                position: 'relative' as const,
                overflow: 'hidden' as const
            },
            glowTopRight: {
                position: 'absolute' as const,
                top: '-20%',
                right: '-10%',
                width: '800px',
                height: '800px',
                background: `radial-gradient(circle, ${accentColor}30 0%, transparent 60%)`,
                filter: 'blur(80px)',
                zIndex: 1,
            },
            glowBottomLeft: {
                position: 'absolute' as const,
                bottom: '-30%',
                left: '-20%',
                width: '900px',
                height: '900px',
                background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)`,
                filter: 'blur(100px)',
                zIndex: 1,
            },
            noise: {
                position: 'absolute' as const,
                inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
                opacity: 0.5,
                zIndex: 2,
                mixBlendMode: 'overlay' as const,
            },
            headerContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6 },
            brandText: { 
                fontSize: 16, 
                fontWeight: 700,
                color: '#71717a', 
                letterSpacing: '4px',
                textTransform: 'uppercase' as const
            },
            userInfoText: { 
                fontSize: 20, 
                color: '#a1a1aa', 
                fontWeight: 500,
                letterSpacing: '0.5px'
            },
            avatarContainer: {
                width: 180, 
                height: 180, 
                borderRadius: '50%',
                border: `2px solid rgba(255,255,255,0.1)`,
                background: `linear-gradient(135deg, rgba(20,20,22,0.9) 0%, rgba(10,10,10,0.95) 100%)`,
                display: 'flex', 
                flexDirection: 'column' as const, 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: `0 0 80px ${accentColor}35, inset 0 0 20px ${accentColor}10`,
                margin: '24px 0',
                position: 'relative' as const
            },
            avatarInnerRing: {
                position: 'absolute' as const,
                inset: 4,
                borderRadius: '50%',
                border: `1px solid ${accentColor}40`,
            },
            avatarHanja: { 
                fontSize: 84, 
                fontWeight: 900, 
                color: '#ffffff', 
                lineHeight: 1,
                textShadow: `0 0 30px ${accentColor}60`
            },
            avatarElementText: { 
                fontSize: 22, 
                color: accentColor, 
                fontWeight: 600, 
                marginTop: -4,
                letterSpacing: '1px'
            },
            descText: {
                fontSize: 32,
                color: '#f4f4f5', 
                textAlign: 'center' as const,
                maxWidth: 700,
                lineHeight: 1.3,
                fontWeight: 700,
                letterSpacing: '-0.5px',
                wordBreak: 'keep-all' as const
            },
            keywordsContainer: { display: 'flex', gap: 12, marginTop: 8 },
            keywordPill: {
                padding: '8px 20px',
                borderRadius: 100,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 18,
                fontWeight: 500,
                color: '#d4d4d8', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            },
            footerContainer: {
                position: 'absolute' as const,
                bottom: 40,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: 0.6
            }
        };

        return new ImageResponse(
            (
                <div {...{ style: STYLES.container }}>
                    {/* Background Ambient Glows */}
                    {/* Top Right Glow */}
                    <div {...{ style: STYLES.glowTopRight }} />
                    
                    {/* Bottom Left Subtle Glow */}
                    <div {...{ style: STYLES.glowBottomLeft }} />

                    {/* Noise Texture Overlay (Simulated via SVG) - adds premium grit */}
                     <div {...{ style: STYLES.noise }} />

                    {/* Main Content Glass Card */}
                    <div {...{ style: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '48px 64px',
                        background: 'rgba(20,20,22,0.4)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 32,
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                        zIndex: 10,
                        maxWidth: '92%',
                        width: type === 'card' ? '700px' : '900px'
                    } }} >
                        
                        {/* Header: Branding & User Info */}
                        <div {...{ style: STYLES.headerContainer }}>
                            <span {...{ style: STYLES.brandText }}>
                                SAJUCHAIN
                            </span>
                            <span {...{ style: STYLES.userInfoText }}>
                                {name} · {birthdate}
                            </span>
                        </div>

                        {/* Central Avatar / Concept Badge */}
                        <div {...{ style: STYLES.avatarContainer }}>
                             {/* Inner Ring Glow */}
                             <div {...{ style: STYLES.avatarInnerRing }} />

                            <span {...{ style: STYLES.avatarHanja }}>
                                {dayMaster}
                            </span>
                            <span {...{ style: STYLES.avatarElementText }}>
                                {dayMasterElement}
                            </span>
                        </div>

                        {/* Descriptive Statement */}
                        <div {...{ style: STYLES.descText }}>
                            &quot;{desc}&quot;
                        </div>

                        {/* Keywords Pills */}
                        <div {...{ style: STYLES.keywordsContainer }}>
                            {keywords.map((k, i) => (
                                <div key={i} {...{ style: STYLES.keywordPill }}>
                                    #{k.trim()}
                                </div>
                            ))}
                        </div>

                    </div>
                    
                    {/* Bottom Branding / URL */}
                    <div {...{ style: STYLES.footerContainer }}>
                         <span {...{ style: { fontSize: 16, fontWeight: 500, color: '#a1a1aa' } }}>Analyzed by</span>
                         <div {...{ style: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#71717a' } }} />
                         <span {...{ style: { fontSize: 16, fontWeight: 700, color: '#e4e4e7', letterSpacing: '1px' } }}>SAJUCHAIN.COM</span>
                    </div>

                </div>
            ),
            {
                width: type === 'card' ? 900 : 1200,
                height: type === 'card' ? 900 : 630,
            },
        );
    } catch (e: unknown) {
        console.log(e instanceof Error ? e.message : 'Unknown error');
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
