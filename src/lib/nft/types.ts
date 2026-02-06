export interface Attribute {
    trait_type: string;
    value: string;
}

export interface Creator {
    address: string;
    share: number;
}

export interface File {
    uri: string;
    type: string;
}

export interface SajuNFTMetadata {
    name: string;
    symbol: string;
    description: string;
    image: string;
    external_url: string;
    attributes: Attribute[];
    properties: {
        category: 'image';
        creators: Creator[];
        files: File[];
    };
}
