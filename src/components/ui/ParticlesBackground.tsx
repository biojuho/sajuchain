"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ParticlesBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Generate mystical floating particles
  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 20 + 15, // Slow, ethereal movement
    delay: Math.random() * 8, // Staggered start
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-400/30 blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: ["0%", "-100%", "20%"],
            x: ["0%", "15%", "-10%", "0%"],
            opacity: [0, 0.6, 0.2, 0],
            scale: [1, 1.5, 0.8, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
