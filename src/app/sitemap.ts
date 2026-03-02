import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://sajuchain.com';
    const sitemaps: MetadataRoute.Sitemap = [];

    const staticRoutes = [
        { path: '', changeFrequency: 'daily' as const, priority: 1 },
        { path: '/auth', changeFrequency: 'monthly' as const, priority: 0.5 },
        { path: '/compatibility', changeFrequency: 'weekly' as const, priority: 0.8 },
        { path: '/tojeong', changeFrequency: 'weekly' as const, priority: 0.8 },
        { path: '/chat', changeFrequency: 'weekly' as const, priority: 0.7 },
        { path: '/mint', changeFrequency: 'monthly' as const, priority: 0.6 },
    ];

    routing.locales.forEach((locale) => {
        staticRoutes.forEach((route) => {
            sitemaps.push({
                url: `${baseUrl}/${locale}${route.path}`,
                lastModified: new Date(),
                changeFrequency: route.changeFrequency,
                priority: route.priority,
                alternates: {
                    languages: routing.locales.reduce((acc, curr) => {
                        acc[curr] = `${baseUrl}/${curr}${route.path}`;
                        return acc;
                    }, {} as Record<string, string>)
                }
            });
        });
    });

    return sitemaps;
}
