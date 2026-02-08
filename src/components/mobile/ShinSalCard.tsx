import { motion } from "framer-motion";

interface ShinSalProps {
    data: {
        dohwa: { has: boolean; count: number; description: string };
        yeokma: { has: boolean; count: number; description: string };
        hwagae: { has: boolean; count: number; description: string };
    };
}

export default function ShinSalCard({ data }: ShinSalProps) {
    if (!data) return null;

    const stars = [
        {
            key: 'dohwa',
            name: '도화살',
            sub: '인기/매력',
            emoji: '🌸',
            color: '#ec4899', // Pink
            data: data.dohwa,
            bg: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(236,72,153,0.05))'
        },
        {
            key: 'yeokma',
            name: '역마살',
            sub: '이동/변화',
            emoji: '🐎',
            color: '#3b82f6', // Blue
            data: data.yeokma,
            bg: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))'
        },
        {
            key: 'hwagae',
            name: '화개살',
            sub: '예술/명예',
            emoji: '🎨',
            color: '#eab308', // Yellow
            data: data.hwagae,
            bg: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.05))'
        }
    ];

    const activeStar = stars.find(s => s.data.has);

    return (
        <div style={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 18,
            padding: 20,
            marginBottom: 16,
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Shimmer Effect */}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "linear",
                    repeatDelay: 1.5
                }}
                style={{
                    position: "absolute",
                    top: 0, left: 0, width: "50%", height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
                    transform: "skewX(-20deg)",
                    pointerEvents: "none",
                    zIndex: 1
                }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, position: "relative", zIndex: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>신살(神殺) 분석</span>
                <span style={{ fontSize: 11, color: "#52525b" }}>내 안의 잠재적 에너지</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {stars.map((star) => (
                    <div key={star.key} style={{
                        background: star.data.has ? star.bg : "#27272a",
                        border: star.data.has ? `1px solid ${star.color}60` : "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 14,
                        padding: "12px 0",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        opacity: star.data.has ? 1 : 0.4,
                        position: "relative"
                    }}>
                        {star.data.has && (
                            <div style={{
                                position: "absolute", top: -6, right: -6,
                                background: star.color, color: "#fff",
                                fontSize: 9, fontWeight: 700,
                                width: 18, height: 18, borderRadius: 9,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: `0 2px 8px ${star.color}60`
                            }}>
                                {star.data.count}
                            </div>
                        )}
                        <span style={{ fontSize: 24 }}>{star.emoji}</span>
                        <div style={{ fontSize: 13, fontWeight: 700, color: star.data.has ? "#fff" : "#a1a1aa" }}>{star.name}</div>
                        <div style={{ fontSize: 10, color: star.data.has ? star.color : "#71717a" }}>{star.sub}</div>
                    </div>
                ))}
            </div>

            {activeStar ? (
                <div style={{
                    marginTop: 16,
                    padding: 12, borderRadius: 12,
                    background: "rgba(255,255,255,0.03)",
                    borderLeft: `3px solid ${activeStar.color}`
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: activeStar.color }}>
                            강력한 {activeStar.name} 에너지
                        </span>
                    </div>
                    <div style={{ fontSize: 13, color: "#d4d4d8", lineHeight: 1.5 }}>
                        {activeStar.data.description}
                    </div>
                </div>
            ) : (
                <div style={{ marginTop: 16, fontSize: 12, color: "#71717a", textAlign: "center" }}>
                    강하게 드러나는 살은 없으나, 그만큼 평온한 삶을 시사합니다.
                </div>
            )}
        </div>
    );
}
