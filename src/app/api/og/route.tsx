import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

 
 
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Data Params
        const type = searchParams.get('type') || 'og'; // 'og' | 'card'
        const name = searchParams.get('name') || 'User';
        const birthdate = searchParams.get('birthdate') || '2000.01.01';
        const dayMaster = searchParams.get('dayMaster') || '甲';
        const dayMasterElement = searchParams.get('dayMasterElement') || '목';
        const keywords = (searchParams.get('keywords') || 'Leader,Innovative,Strong').split(',');
        const desc = searchParams.get('desc') || 'The master of their own destiny.';

        // Colors
        const map: Record<string, string> = { '목': '#22c55e', '화': '#ef4444', '토': '#eab308', '금': '#cbd5e1', '수': '#3b82f6' };
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
                        padding: '40px 60px',
                        border: '2px solid rgba(255,255,255,0.1)',
                        borderRadius: 30,
                        backgroundColor: 'rgba(24, 24, 27, 0.6)', // Zinc-900 transparent
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        maxWidth: '90%'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: 24, color: '#a1a1aa', letterSpacing: '2px' }}>SAJU CHAIN AI</span>
                            <span style={{ fontSize: 16, color: '#52525b', marginTop: 8 }}>{birthdate} • {name}</span>
                        </div>

                        {/* Main Badge */}
                        <div style={{
                            width: 160, height: 160, borderRadius: '50%',
                            border: `4px solid ${accentColor}`,
                            background: `${accentColor}15`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 0 60px ${accentColor}40`,
                            margin: '20px 0'
                        }}>
                            <span style={{ fontSize: 80, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{dayMaster}</span>
                            <span style={{ fontSize: 24, color: accentColor, fontWeight: 700, marginTop: -5 }}>{dayMasterElement}</span>
                        </div>

                        {/* Keywords */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            {keywords.map((k, i) => (
                                <div key={i} style={{
                                    padding: '8px 24px',
                                    borderRadius: 50,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: 20,
                                    fontWeight: 600,
                                    color: '#e4e4e7'
                                }}>#{k}</div>
                            ))}
                        </div>

                        {/* Description (New) */}
                        <div style={{
                            marginTop: 10,
                            fontSize: 24,
                            color: '#e4e4e7',
                            textAlign: 'center',
                            maxWidth: 600,
                            lineHeight: 1.4,
                            fontWeight: 500,
                            opacity: 0.9
                        }}>
                            &quot;{desc}&quot;
                        </div>

                        {/* Footer */}
                        <div style={{ marginTop: 30, fontSize: 14, color: '#52525b', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ opacity: 0.5 }}>Analyzed by</span> <span style={{ fontWeight: 'bold' }}>SajuChain</span>
                        </div>
                    </div>
                </div>
            ),
            {
                width: type === 'card' ? 800 : 1200,
                height: type === 'card' ? 800 : 630,
            },
        );
    } catch (e: unknown) {
        console.log(e instanceof Error ? e.message : 'Unknown error');
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
