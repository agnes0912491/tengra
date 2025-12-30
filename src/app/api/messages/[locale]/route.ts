import { NextResponse } from 'next/server';
import { loadTranslations } from '@tengra/language/server';
import config from '@/tl.config';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ locale: string }> }
) {
    const { locale } = await params;

    console.info("[tengra:messages]", { method: "GET", path: new URL(request.url).pathname, locale });

    if (!config.locales.includes(locale)) {
        return NextResponse.json({ error: "Locale not found" }, { status: 404 });
    }

    try {
        const messages = loadTranslations(config, locale);
        return NextResponse.json(messages, {
            headers: {
                "Cache-Control": "public, max-age=300"
            }
        });
    } catch (error) {
        console.error(`[API] Failed to load translations for ${locale}:`, error);
        return NextResponse.json({ error: 'Failed to load translations' }, { status: 500 });
    }
}
