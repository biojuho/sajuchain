import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Data Params
        const type = searchParams.get('type') || 'og'; // 'og' | 'card'
        const name = searchParams.get('name') || 'User';
        const birthdate = searchParams.get('birthdate') || '2000.01.01';
        const dayMaster = searchParams.get('dayMaster') || '甲';
        const dayMasterElement = searchParams.get('dayMasterElement') || '목';
        const mbti = searchParams.get('mbti') || 'ENTJ'; // Optional
        const keywords = (searchParams.get('keywords') || 'Leader,Innovative,Strong').split(',');

        // Colors
        const map: any = { '목': '#22c55e', '화': '#ef4444', '토': '#eab308', '금': '#cbd5e1', '수': '#3b82f6' };
        const accentColor = map[dayMasterElement] || '#a855f7';

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
                        backgroundColor: '#09090b', // Zinc-950
                        color: 'white',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background Gradient */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-20%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '800px',
                            height: '800px',
                            background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
                            filter: 'blur(60px)',
                        }}
                    />

                    {/* Content Container */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20,
                        zIndex: 10,
                        padding: 40,
                        border: '2px solid rgba(255,255,255,0.1)',
                        borderRadius: 30,
                        backgroundColor: 'rgba(24, 24, 27, 0.6)', // Zinc-900 transparent
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: 24, color: '#a1a1aa' }}>SAJU CHAIN AI</span>
                            <span style={{ fontSize: 16, color: '#52525b', marginTop: 4 }}>{birthdate} • {name}</span>
                        </div>

                        {/* Main Badge */}
                        <div style={{
                            width: 140, height: 140, borderRadius: '50%',
                            border: `4px solid ${accentColor}`,
                            background: `${accentColor}20`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 0 40px ${accentColor}60`,
                            margin: '10px 0'
                        }}>
                            <span style={{ fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{dayMaster}</span>
                            <span style={{ fontSize: 20, color: accentColor, fontWeight: 700 }}>{dayMasterElement}</span>
                        </div>

                        {/* Keywords */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            {keywords.map((k, i) => (
                                <div key={i} style={{
                                    padding: '8px 20px',
                                    borderRadius: 50,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: 18,
                                    color: '#e4e4e7'
                                }}>#{k}</div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={{ marginTop: 20, fontSize: 14, color: '#52525b' }}>
                            sajuchain.com
                        </div>
                    </div>
                </div>
            ),
            {
                width: type === 'card' ? 800 : 1200,
                height: type === 'card' ? 800 : 630,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
