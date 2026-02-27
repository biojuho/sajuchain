import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

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

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000000', // Pure black for better contrast
                        fontFamily: 'Inter, "Pretendard", sans-serif',
                        position: 'relative',
                        overflow: 'hidden' // Ensure glow doesn't bleed
                    }}
                >
                    {/* Background Ambient Glows */}
                    {/* Top Right Glow */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-20%',
                            right: '-10%',
                            width: '800px',
                            height: '800px',
                            background: `radial-gradient(circle, ${accentColor}30 0%, transparent 60%)`,
                            filter: 'blur(80px)',
                            zIndex: 1,
                        }}
                    />
                    
                    {/* Bottom Left Subtle Glow */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-30%',
                            left: '-20%',
                            width: '900px',
                            height: '900px',
                            background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)`,
                            filter: 'blur(100px)',
                            zIndex: 1,
                        }}
                    />

                    {/* Noise Texture Overlay (Simulated via SVG) - adds premium grit */}
                     <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
                            opacity: 0.5,
                            zIndex: 2,
                            mixBlendMode: 'overlay',
                        }}
                    />


                    {/* Main Content Glass Card */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 24,
                        zIndex: 10,
                        padding: '48px 64px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 32,
                        backgroundColor: 'rgba(10, 10, 10, 0.75)', // Deep dark transparent
                        boxShadow: `0 30px 60px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.05), inset 0 0 40px rgba(${parseInt(accentColor.slice(1,3), 16) || 0}, ${parseInt(accentColor.slice(3,5), 16) || 0}, ${parseInt(accentColor.slice(5,7), 16) || 0}, 0.05)`, // Inner glow matching accent
                        maxWidth: '92%',
                        width: type === 'card' ? '700px' : '900px'
                    }}>
                        
                        {/* Header: Branding & User Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <span style={{ 
                                fontSize: 16, 
                                fontWeight: 700,
                                color: '#71717a', // Zinc-500
                                letterSpacing: '4px',
                                textTransform: 'uppercase'
                            }}>
                                SAJUCHAIN
                            </span>
                            <span style={{ 
                                fontSize: 20, 
                                color: '#a1a1aa', // Zinc-400
                                fontWeight: 500,
                                letterSpacing: '0.5px'
                            }}>
                                {name} · {birthdate}
                            </span>
                        </div>

                        {/* Central Avatar / Concept Badge */}
                        <div style={{
                            width: 180, 
                            height: 180, 
                            borderRadius: '50%',
                            border: `2px solid rgba(255,255,255,0.1)`,
                            background: `linear-gradient(135deg, rgba(20,20,22,0.9) 0%, rgba(10,10,10,0.95) 100%)`,
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            boxShadow: `0 0 80px ${accentColor}35, inset 0 0 20px ${accentColor}10`,
                            margin: '24px 0',
                            position: 'relative'
                        }}>
                             {/* Inner Ring Glow */}
                             <div style={{
                                position: 'absolute',
                                inset: 4,
                                borderRadius: '50%',
                                border: `1px solid ${accentColor}40`,
                            }} />

                            <span style={{ 
                                fontSize: 84, 
                                fontWeight: 900, 
                                color: '#ffffff', 
                                lineHeight: 1,
                                textShadow: `0 0 30px ${accentColor}60` // Glow text effect
                            }}>
                                {dayMaster}
                            </span>
                            <span style={{ 
                                fontSize: 22, 
                                color: accentColor, 
                                fontWeight: 600, 
                                marginTop: -4,
                                letterSpacing: '1px'
                            }}>
                                {dayMasterElement}
                            </span>
                        </div>

                        {/* Descriptive Statement */}
                        <div style={{
                            fontSize: 32,
                            color: '#f4f4f5', // Zinc-100
                            textAlign: 'center',
                            maxWidth: 700,
                            lineHeight: 1.3,
                            fontWeight: 700,
                            letterSpacing: '-0.5px',
                            wordBreak: 'keep-all' // Important for Korean
                        }}>
                            &quot;{desc}&quot;
                        </div>

                        {/* Keywords Pills */}
                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            {keywords.map((k, i) => (
                                <div key={i} style={{
                                    padding: '8px 20px',
                                    borderRadius: 100,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    fontSize: 18,
                                    fontWeight: 500,
                                    color: '#d4d4d8', // Zinc-300
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}>
                                    #{k.trim()}
                                </div>
                            ))}
                        </div>

                    </div>
                    
                    {/* Bottom Branding / URL */}
                    <div style={{
                        position: 'absolute',
                        bottom: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        opacity: 0.6
                    }}>
                         <span style={{ fontSize: 16, fontWeight: 500, color: '#a1a1aa' }}>Analyzed by</span>
                         <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#71717a' }} />
                         <span style={{ fontSize: 16, fontWeight: 700, color: '#e4e4e7', letterSpacing: '1px' }}>SAJUCHAIN.COM</span>
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
