export interface SajuKnowledgeChunk {
    id: string;
    category: string;
    content: string;
}

export const JAPYEONG_KNOWLEDGE: SajuKnowledgeChunk[] = [
    {
        id: "ten_gods_definition",
        category: "Basic Theory",
        content: "자평진전(子平眞詮)에서 십신(Ten Gods)은 일간(Day Master)과 다른 간지(Stem/Branch)와의 생극제화 관계를 의미한다. 비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인을 말하며, 이는 사회적 관계와 심리적 성향을 분석하는 핵심 도구이다."
    },
    {
        id: "useful_god_concept",
        category: "Useful God",
        content: "용신(Useful God)은 사주의 중화를 맞추기 위해 가장 필요한 오행이나 십신을 말한다. 자평진전에서는 월령(Month Branch)을 기준으로 격국(Structure)을 정하고, 그 격국을 생하거나 제어하는 글자를 용신으로 삼는 것이 원칙이다."
    },
    {
        id: "resource_god",
        category: "Ten Gods",
        content: "인성(Resource God)은 일간을 생하는 기운으로, 정인과 편인으로 나뉜다. 정인은 학문, 명예, 모친을 상징하며, 편인은 눈치, 직관, 계모를 상징한다. 자평진전에서는 인성이 관살(Official)의 기운을 설기하여 일간을 돕는 '관인상생'을 귀하게 여긴다."
    },
    {
        id: "official_god",
        category: "Ten Gods",
        content: "관성(Official God)은 일간을 극하는 기운으로, 정관과 편관(칠살)으로 나뉜다. 정관은 규율, 명예, 남편을 상징하고, 편관은 권위, 압력, 고난을 상징한다. 자평진전에서는 정관격이 손상되지 않고 재성과 인성의 보좌를 받을 때 가장 길하다고 본다."
    },
    {
        id: "wealth_god",
        category: "Ten Gods",
        content: "재성(Wealth God)은 일간이 극하는 기운으로, 정재와 편재로 나뉜다. 정재는 고정적인 수입과 성실함을, 편재는 유동적인 큰 재물과 사업성을 상징한다. 자평진전에서는 재성이 관성을 생하는 '재생관'의 구조를 부귀를 겸비한 명조로 본다."
    },
    {
        id: "seasonal_combination",
        category: "Combination",
        content: "방합(Seasonal Combination)은 인묘진(봄/목), 사오미(여름/화), 신유술(가을/금), 해자축(겨울/수)와 같이 계절의 기운이 모여 강력한 세력을 형성하는 것을 말한다. 이는 삼합보다 계절적 기운이 강하며, 형제나 동료와의 결속력을 상징하기도 한다."
    },
    {
        id: "three_harmony",
        category: "Combination",
        content: "삼합(Three Harmony Combination)은 생지, 왕지, 고지가 만나 하나의 옥행국을 이루는 것이다. 해묘미(목국), 인오술(화국), 사유축(금국), 신자진(수국)이 있다. 이는 사회적 합, 목적 지향적인 결합을 의미하며 매우 강력한 기운을 형성한다."
    }
];
