/**
 * Shared pillar mapping utilities for converting raw saju pillar data
 * into UI-friendly formatted objects.
 *
 * Used by SajuAppRedesigned (form complete + history replay) and
 * potentially other components that need formatted pillar data.
 */

import type { PillarData } from '@/types';
import { GAN_NAMES, ZHI_NAMES } from './saju-data';

/** Formatted pillar data ready for UI rendering */
export interface FormattedPillar {
    stem: string;
    stemName: string;
    stemElement: string;
    branch: string;
    branchName: string;
    branchElement: string;
    tenGod: string;
    unseong: string;
}

/** Earthly Branch Hanja → element in Korean */
const ZHI_ELEMENTS: Record<string, string> = {
    '子': '수', '亥': '수',
    '寅': '목', '卯': '목',
    '巳': '화', '午': '화',
    '申': '금', '酉': '금',
    '辰': '토', '戌': '토', '丑': '토', '未': '토',
};

/** Convert raw PillarData to UI-formatted pillar */
export function formatPillar(pillar: PillarData): FormattedPillar {
    return {
        stem: pillar.heavenlyStem,
        stemName: GAN_NAMES[pillar.heavenlyStem] || '천간',
        stemElement: pillar.element || '',
        branch: pillar.earthlyBranch,
        branchName: ZHI_NAMES[pillar.earthlyBranch] || '지지',
        branchElement: ZHI_ELEMENTS[pillar.earthlyBranch] || '토',
        tenGod: pillar.tenGod || '',
        unseong: pillar.unseong || '',
    };
}

/** Color name → hex code mapping for lucky items (English and Korean keys) */
export const COLOR_HEX_MAP: Record<string, string> = {
    // English keys
    Purple: '#a855f7',
    Red: '#ef4444',
    Blue: '#3b82f6',
    Green: '#22c55e',
    Yellow: '#eab308',
    White: '#e2e8f0',
    Black: '#000000',
    // Korean aliases (AI may return Korean color names)
    '보라': '#a855f7',
    '빨강': '#ef4444',
    '파랑': '#3b82f6',
    '초록': '#22c55e',
    '녹색': '#22c55e',
    '노랑': '#eab308',
    '흰색': '#e2e8f0',
    '검정': '#000000',
};

export function getColorHex(color: string): string {
    return COLOR_HEX_MAP[color] || '#a855f7';
}
