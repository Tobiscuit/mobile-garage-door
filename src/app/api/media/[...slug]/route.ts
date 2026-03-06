import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@/lib/cloudflare';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    const { env } = await getCloudflareContext();
    const resolvedParams = await params;

    if (!resolvedParams || !resolvedParams.slug) {
        return new Response('Not Found', { status: 404 });
    }

    // Handle different potential bucket keys depending on how it was uploaded
    // (e.g., 'file/filename.webp', 'blog/filename.webp', or just 'filename.webp')
    const fullSlug = resolvedParams.slug.join('/');
    const withoutPrefix = resolvedParams.slug.slice(1).join('/');

    const possibleKeys = [
        fullSlug,
        withoutPrefix,
        `media/${withoutPrefix}`
    ];

    let object = null;
    for (const key of possibleKeys) {
        if (!key) continue;
        object = await env.MEDIA_BUCKET.get(key);
        if (object !== null) break;
    }

    if (object === null) {
        return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers as any);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body as any, {
        headers,
    });
}
