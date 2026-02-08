
import React from 'react';
import { Share, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShareButtonProps {
    onClick: () => void;
    label?: string;
}

export default function ShareButton({ onClick, label = "Share to Instagram" }: ShareButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-500/30 text-white font-bold transition-all hover:shadow-purple-500/50"
        >
            <Instagram className="w-5 h-5" />
            <span>{label}</span>
        </motion.button>
    );
}
