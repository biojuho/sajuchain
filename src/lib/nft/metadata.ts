import { SajuData } from '@/types';
import { SajuNFTMetadata } from './types';

export const generateMetadata = (
    result: SajuData,
    imageUri: string,
    mintAddress?: string
): SajuNFTMetadata => {
    const identifier = mintAddress && mintAddress !== 'PENDING' ? mintAddress.slice(0, 6) : `GEN-${Date.now().toString().slice(-6)}`;

    return {
        name: `SajuChain #${identifier} - ${result.fourPillars.year.heavenlyStem}${result.fourPillars.year.earthlyBranch}년`,
        symbol: 'SAJU',
        description: `This NFT certifies the eternal record of the Saju (Four Pillars) analysis for ${result.name || 'User'}. Born on ${result.birthDate} ${result.birthTime || ''}.`,
        image: imageUri,
        external_url: 'https://sajuchain.vercel.app',
        attributes: [
            { trait_type: 'Year Pillar', value: `${result.fourPillars.year.heavenlyStem}${result.fourPillars.year.earthlyBranch}` },
            { trait_type: 'Month Pillar', value: `${result.fourPillars.month.heavenlyStem}${result.fourPillars.month.earthlyBranch}` },
            { trait_type: 'Day Pillar', value: `${result.fourPillars.day.heavenlyStem}${result.fourPillars.day.earthlyBranch}` },
            { trait_type: 'Hour Pillar', value: `${result.fourPillars.hour.heavenlyStem}${result.fourPillars.hour.earthlyBranch}` },
            { trait_type: 'Dominant Element', value: result.fiveElements?.dominant || 'Unknown' },
            { trait_type: 'Lacking Element', value: result.fiveElements?.lacking || 'Unknown' },
            { trait_type: 'Lucky Color', value: result.aiResult?.luckyItems?.color || 'Unknown' },
            { trait_type: 'Lucky Number', value: String(result.aiResult?.luckyItems?.number || 'Unknown') },
            { trait_type: 'Overall Fortune', value: result.aiResult?.headline || 'Unknown' },
            { trait_type: 'Gender', value: result.gender },
            { trait_type: 'Calendar Type', value: result.calendarType || 'solar' }
        ],
        properties: {
            category: 'image',
            creators: [
                {
                    address: process.env.NEXT_PUBLIC_TREASURY_WALLET || '11111111111111111111111111111111',
                    share: 100
                }
            ],
            files: [
                {
                    uri: imageUri,
                    type: 'image/png'
                }
            ]
        }
    };
};
