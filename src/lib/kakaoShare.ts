interface KakaoShareOptions {
    title: string;
    description: string;
    imageUrl: string;
    webUrl: string;
    buttonTitle?: string;
}

export function sendKakaoShare(options: KakaoShareOptions): boolean {
    if (typeof window === 'undefined') return false;

    const Kakao = window.Kakao;

    if (!Kakao || !Kakao.isInitialized()) {
        alert('카카오 공유 기능을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        return false;
    }

    Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: options.title,
            description: options.description,
            imageUrl: options.imageUrl,
            link: {
                webUrl: options.webUrl,
                mobileWebUrl: options.webUrl,
            },
        },
        buttons: [
            {
                title: options.buttonTitle || '나도 운세 보기',
                link: {
                    webUrl: options.webUrl,
                    mobileWebUrl: options.webUrl,
                },
            },
        ],
    });

    return true;
}
