import { SajuData } from '@/types';

/**
 * Generates a PNG Data URI from Saju data using HTML5 Canvas.
 * This function mimics the visual style of SajuNFTCard.tsx but renders entirely in logic.
 */
export async function generateNFTImage(data: SajuData): Promise<string> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.warn('generateNFTImage called on server side, returning empty string');
        return '';
    }

    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // 1. Background (Gradient based on Dominant Element)
    const gradients: Record<string, string[]> = {
        '목(木)': ['#14532d', '#16a34a'], // Green
        '화(火)': ['#7f1d1d', '#dc2626'], // Red
        '토(土)': ['#713f12', '#ca8a04'], // Yellow/Brown
        '금(金)': ['#1f2937', '#9ca3af'], // Gray/Silver
        '수(水)': ['#1e3a8a', '#2563eb'], // Blue
    };
    const colors = data.fiveElements
        ? (gradients[data.fiveElements.dominant] || ['#312e81', '#4c1d95'])
        : ['#312e81', '#4c1d95'];

    const grd = ctx.createLinearGradient(0, 0, width, height);
    grd.addColorStop(0, colors[0]);
    grd.addColorStop(1, colors[1]);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    // 2. Texture/Noise Overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillRect(x, y, 2, 2);
    }

    // 3. Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 40;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // 4. Header Text
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('SAJUCHAIN', 100, 150);

    ctx.font = 'bold 120px Noto Serif KR, serif';
    ctx.fillStyle = '#ffffff';
    const yearText = `${data.fourPillars.year.heavenlyStem}${data.fourPillars.year.earthlyBranch}`;
    ctx.fillText(yearText, 100, 280);

    const genesisBadge = '#GENESIS';
    ctx.font = '40px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(genesisBadge, width - 300, 150);

    // 5. Four Pillars  // 2. Pillars
    const pillars = [
        { label: 'YEAR', ...data.fourPillars.year! },
        { label: 'MONTH', ...data.fourPillars.month! },
        { label: 'DAY', ...data.fourPillars.day! },
        { label: 'HOUR', ...data.fourPillars.hour! },
    ];

    const centerX = width / 2;
    const startY = 450;
    const gap = 200;
    const startX = centerX - (gap * 1.5);

    ctx.font = 'bold 100px Noto Serif KR, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    pillars.forEach((p, i) => {
        const x = startX + (i * gap);

        // Heavenly Stem
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x, startY, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(p.heavenlyStem, x, startY + 5);

        // Connection Line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, startY + 70);
        ctx.lineTo(x, startY + 230);
        ctx.stroke();

        // Earthly Branch
        ctx.save();
        ctx.translate(x, startY + 300);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(-60, -60, 120, 120);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeRect(-60, -60, 120, 120);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(p.earthlyBranch, 0, 5);
        ctx.restore();
    });

    // 6. Footer Info
    const footerY = 950;
    const footerHeight = 150;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(80, footerY, width - 160, footerHeight);

    // Reset text alignment
    ctx.textAlign = 'left';

    // Dominant
    ctx.font = '30px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('DOMINANT', 120, footerY + 50);
    ctx.font = 'bold 50px Noto Serif KR, serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(data.fiveElements?.dominant || 'Unknown', 120, footerY + 110);

    // Lucky
    ctx.font = '30px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('LUCKY NO.', 500, footerY + 50);
    ctx.font = 'bold 50px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    const luckyNum = data.aiResult?.luckyItems?.number || 0;
    ctx.fillText(luckyNum.toString(), 500, footerY + 110);

    // Generated Date
    ctx.font = '30px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'right';
    ctx.fillText(data.birthDate, width - 120, footerY + 110);

    return canvas.toDataURL('image/png');
}
