declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value,
        });
    }
}

export const trackInterpretation = () => trackEvent('interpretation', 'saju');
export const trackPayment = (amount: number) => trackEvent('purchase', 'payment', 'premium', amount);
export const trackShare = (platform: string) => trackEvent('share', 'social', platform);
export const trackChat = () => trackEvent('message', 'chat');
export const trackSignup = (provider: string) => trackEvent('sign_up', 'auth', provider);
export const trackLimitHit = (type: 'interpret' | 'chat', blockedActionKey?: string) =>
    trackEvent('limit_hit', 'upsell', blockedActionKey || type);
export const trackUpgradeClick = (type: 'interpret' | 'chat', blockedActionKey?: string) =>
    trackEvent('upgrade_click', 'upsell', blockedActionKey || type);
export const trackUpgradeSuccess = (blockedActionKey?: string) =>
    trackEvent('upgrade_success', 'upsell', blockedActionKey || 'premium');
export const trackPageView = (path: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, { page_path: path });
    }
};
