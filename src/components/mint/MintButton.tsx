'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface MintButtonProps {
    onMint: () => void;
    isMinting: boolean;
    disabled?: boolean;
}

export default function MintButton({ onMint, isMinting, disabled }: MintButtonProps) {
    const { connected } = useWallet();

    const isMock = process.env.NEXT_PUBLIC_MOCK_MINT === 'true';

    if (!connected && !isMock) {
        return (
            <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-yellow-400/80 mb-2">지갑을 연결해야 민팅할 수 있습니다</p>
                <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !transition-colors" />
            </div>
        );
    }

    return (
        <button
            onClick={onMint}
            disabled={isMinting || disabled}
            className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg tracking-wide transition-all shadow-lg
                ${isMinting
                    ? 'bg-gray-600 cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black shadow-yellow-500/20'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
            `}
        >
            {isMinting ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Minting...
                </span>
            ) : (
                'MINT SAJU NFT (Devnet)'
            )}
        </button>
    );
}
