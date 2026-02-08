'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
    interface Window {
        Kakao: any;
    }
}

export default function KakaoScript() {
    return (
        <Script
            src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
            integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2txfZW45nlxzCSL75bM20v"
            crossOrigin="anonymous"
            onLoad={() => {
                if (window.Kakao && !window.Kakao.isInitialized()) {
                    // Initialize if API Key exists, otherwise log warning
                    const apiKey = process.env.NEXT_PUBLIC_KAKAO_API_KEY;
                    if (apiKey) {
                        window.Kakao.init(apiKey);
                    } else {
                        // console.warn("Kakao API Key is missing in .env.local");
                    }
                }
            }}
        />
    );
}
