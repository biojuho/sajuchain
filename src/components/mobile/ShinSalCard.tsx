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
        <div className="bg-zinc-900 border border-white/5 rounded-[18px] p-5 mb-4 relative overflow-hidden">
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
                className="absolute top-0 left-0 w-1/2 h-full pointer-events-none z-10 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-[20deg]"
            />

            <div className="flex items-center gap-1.5 mb-4 relative z-20">
                <span className="text-[15px] font-bold">신살(神殺) 분석</span>
                <span className="text-[11px] text-zinc-600">내 안의 잠재적 에너지</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {stars.map((star) => (
                    <div key={star.key}
                        className="rounded-[14px] py-3 flex flex-col items-center gap-1 relative border"
                        style={{
                            background: star.data.has ? star.bg : "#27272a",
                            borderColor: star.data.has ? `${star.color}60` : "rgba(255,255,255,0.06)",
                            opacity: star.data.has ? 1 : 0.4
                        }}>
                        {star.data.has && (
                            <div
                                className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center"
                                style={{
                                    background: star.color,
                                    boxShadow: `0 2px 8px ${star.color}60`
                                }}>
                                {star.data.count}
                            </div>
                        )}
                        <span className="text-2xl">{star.emoji}</span>
                        <div className="text-[13px] font-bold" style={{ color: star.data.has ? "#fff" : "#a1a1aa" }}>{star.name}</div>
                        <div className="text-[10px]" style={{ color: star.data.has ? star.color : "#71717a" }}>{star.sub}</div>
                    </div>
                ))}
            </div>

            {activeStar ? (
                <div
                    className="mt-4 p-3 rounded-xl bg-white/[0.03]"
                    style={{ borderLeft: `3px solid ${activeStar.color}` }}
                >
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold" style={{ color: activeStar.color }}>
                            강력한 {activeStar.name} 에너지
                        </span>
                    </div>
                    <div className="text-[13px] text-zinc-300 leading-relaxed">
                        {activeStar.data.description}
                    </div>
                </div>
            ) : (
                <div className="mt-4 text-xs text-zinc-500 text-center">
                    강하게 드러나는 살은 없으나, 그만큼 평온한 삶을 시사합니다.
                </div>
            )}
        </div>
    );
}
