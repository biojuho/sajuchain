const PptxGenJS = require("pptxgenjs");

const pres = new PptxGenJS();

// Theme Colors
const COLORS = {
    BG: "1A0B2E", // Deep Purple
    ACCENT: "F59E0B", // Gold/Amber
    TEXT_MAIN: "FFFFFF",
    TEXT_SUB: "E9D5FF", // Light Purple
};

// Layout
pres.layout = "LAYOUT_16x9";
pres.background = { color: COLORS.BG };

// Helper to add slide with common styling
function addSlide(title) {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.BG };

    // Add "Confidential" footer
    slide.addText("SajuChain - Confidential", {
        x: 0.5, y: 7.0, w: "90%", h: 0.3,
        fontSize: 10, color: "555555", align: "center"
    });

    if (title) {
        slide.addText(title, {
            x: 0.5, y: 0.5, w: "90%", h: 1.0,
            fontSize: 32, fontFace: "Georgia", color: COLORS.ACCENT, bold: true,
            align: "left"
        });
        // Decorative line
        slide.addShape(pres.ShapeType.line, {
            x: 0.5, y: 1.4, w: "90%", h: 0,
            line: { color: COLORS.ACCENT, width: 2 }
        });
    }
    return slide;
}

// 1. Title Slide
const slide1 = pres.addSlide();
slide1.background = { color: COLORS.BG };
slide1.addText("SajuChain", {
    x: 0, y: 2.5, w: "100%", h: 1.5,
    fontSize: 60, fontFace: "Georgia", color: COLORS.ACCENT, bold: true, align: "center"
});
slide1.addText("Destiny on Chain: Where Ancient Wisdom Meets Eternal Ledger", {
    x: 1, y: 4.0, w: "80%", h: 1,
    fontSize: 24, fontFace: "Arial", color: COLORS.TEXT_MAIN, align: "center"
});
slide1.addText("Investor Presentation 2026", {
    x: 0, y: 6.5, w: "100%", h: 0.5,
    fontSize: 14, color: COLORS.TEXT_SUB, align: "center"
});

// 2. The Problem
const slide2 = addSlide("The Problem: Uncertainty & Ephemerality");
slide2.addText([
    { text: "Subjective Interpretation\n", options: { fontSize: 24, bold: true, breakLine: true } },
    { text: "Fortune telling relies on individual skill, leading to inconsistent results.\n\n", options: { fontSize: 18 } },
    { text: "Lack of Permanence\n", options: { fontSize: 24, bold: true, breakLine: true } },
    { text: "Physical amulets are lost. No permanent digital record of one's destiny.\n\n", options: { fontSize: 18 } },
    { text: "Data Privacy\n", options: { fontSize: 24, bold: true, breakLine: true } },
    { text: "Sensitive birth data shared with unverified services.", options: { fontSize: 18 } }
], { x: 1.0, y: 2.0, w: "80%", h: 4.5, color: COLORS.TEXT_MAIN });

// 3. The Solution
const slide3 = addSlide("The Solution: SajuChain");
slide3.addText("A Tripartite Architecture", { x: 0.5, y: 1.6, w: "90%", h: 0.5, fontSize: 14, color: COLORS.TEXT_SUB, italic: true });

// Column 1
slide3.addText("Algorithmic Precision", { x: 0.5, y: 2.5, w: 4, h: 0.5, fontSize: 20, color: COLORS.ACCENT, bold: true });
slide3.addText("lunar-javascript + GPT-4o for nuanced, accurate readings.", { x: 0.5, y: 3.0, w: 3.5, h: 2, fontSize: 14, color: COLORS.TEXT_MAIN });

// Column 2
slide3.addText("Immutable Ownership", { x: 4.5, y: 2.5, w: 4, h: 0.5, fontSize: 20, color: COLORS.ACCENT, bold: true });
slide3.addText("Minted as Compressed NFTs (cNFT) on Solana. True 'Soulbound' ownership.", { x: 4.5, y: 3.0, w: 3.5, h: 2, fontSize: 14, color: COLORS.TEXT_MAIN });

// Column 3
slide3.addText("Digital Mysticism", { x: 8.5, y: 2.5, w: 4, h: 0.5, fontSize: 20, color: COLORS.ACCENT, bold: true });
slide3.addText("A ritualistic UI experience designed to evoke reverence.", { x: 8.5, y: 3.0, w: 3.5, h: 2, fontSize: 14, color: COLORS.TEXT_MAIN });

// 4. Technology
const slide4 = addSlide("Technical Architecture");
slide4.addText([
    { text: "Frontend: ", options: { bold: true, color: COLORS.ACCENT } },
    { text: "Next.js 16 (App Router), Tailwind CSS v4, Framer Motion\n\n" },
    { text: "Blockchain: ", options: { bold: true, color: COLORS.ACCENT } },
    { text: "Solana Web3.js, Metaplex (Umi), Compressed NFTs\n\n" },
    { text: "AI Engine: ", options: { bold: true, color: COLORS.ACCENT } },
    { text: "Hybrid Logic (Deterministic Saju + Generative LLM)" }
], { x: 1.0, y: 2.0, w: "80%", h: 4.0, fontSize: 18, color: COLORS.TEXT_MAIN, bullet: true });

// 5. Future Vision
const slide5 = addSlide("Future Vision: The Oracle DAO");
slide5.addText([
    { text: "Phase 1: Genesis (Now)", options: { fontSize: 20, bold: true, color: COLORS.ACCENT } },
    { text: "MVP, Devnet, UI/UX Overhaul\n\n", options: { fontSize: 16 } },

    { text: "Phase 2: Expansion (Q3 2026)", options: { fontSize: 20, bold: true, color: COLORS.ACCENT } },
    { text: "Mainnet, Mobile App, Social Compatibility\n\n", options: { fontSize: 16 } },

    { text: "Phase 3: Oracle DAO (2027)", options: { fontSize: 20, bold: true, color: COLORS.ACCENT } },
    { text: "Decentralized interpretation market, Metaverse ID", options: { fontSize: 16 } }
], { x: 1.0, y: 2.0, w: "80%", h: 4.5, color: COLORS.TEXT_MAIN });

// Save
pres.writeFile({ fileName: "sajuchain_pitch_deck.pptx" })
    .then(fileName => {
        console.log(`Created file: ${fileName}`);
    })
    .catch(err => {
        console.error(err);
    });
