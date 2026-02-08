import { SajuData } from '@/types';
import FAMOUS_FIGURES from './data/famous-figures.json';

export interface FamousFigure {
    id: string;
    name: string;
    title: string;
    elementProfile: {
        dominant: string;
        lacking: string;
    };
    desc: string;
    quote: string;
    connectionMsg: string;
}

export class SajuBrain {
    /**
     * Finds a historical figure with a similar elemental profile.
     * Acts as a simulated Vector Search based on "Dominant" and "Lacking" tags.
     */
    static findSoulmate(saju: SajuData): FamousFigure {
        const userDom = saju.fiveElements?.dominant || 'Wood';
        const userLack = saju.fiveElements?.lacking || 'Water';

        // 1. Filter by Dominant Element (Primary Match)
        const candidates = FAMOUS_FIGURES.filter(
            (f) => f.elementProfile.dominant === userDom
        );

        if (candidates.length === 0) {
            // Fallback if no dominant match (shouldn't happen with full DB)
            return FAMOUS_FIGURES[0];
        }

        // 2. Filter by Lacking Element (Secondary Match)
        const perfectMatch = candidates.find(
            (f) => f.elementProfile.lacking === userLack
        );

        if (perfectMatch) {
            return perfectMatch;
        }

        // 3. Fallback: Return random candidate from dominant group
        return candidates[Math.floor(Math.random() * candidates.length)];
    }
}
