'use client';

import Script from 'next/script';
// import { useEffect } from 'react';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    // Initialize if API Key exists, otherwise log warning
                    const apiKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || process.env.NEXT_PUBLIC_KAKAO_API_KEY;
                    if (apiKey) {
                        if (!window.Kakao.isInitialized()) {
                            window.Kakao.init(apiKey);
                            console.log("Kakao SDK Initialized");
                        }
                    } else {
                         console.warn("Kakao JS Key is missing. Add NEXT_PUBLIC_KAKAO_JS_KEY to .env.local");
                    }
                }
            }}
        />
    );
}
