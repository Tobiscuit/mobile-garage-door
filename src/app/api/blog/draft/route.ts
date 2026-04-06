import { getCloudflareContext } from '@/lib/cloudflare';
import { getDB } from '@/db';
import { posts, postKeywords, users, notifications, media } from '@/db/schema';
import { sendWebPush } from '@/lib/web-push';
import { eq } from 'drizzle-orm';
import { GoogleGenAI } from '@google/genai';

const DRAFT_API_KEY_HEADER = 'x-seo-engine-key';

/**
 * POST /api/blog/draft
 * 
 * Receives AI-generated blog drafts from the seo-engine cron worker.
 * Validates API key, inserts as pending_review, generates featured image, notifies admins.
 */
export async function POST(request: Request) {
  const { env } = await getCloudflareContext();

  // Auth: validate shared secret
  const apiKey = request.headers.get(DRAFT_API_KEY_HEADER);
  const expectedKey = (env as any).SEO_ENGINE_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse payload
  let body: {
    title: string;
    slug: string;
    excerpt: string;
    htmlContent: string;
    category: string;
    keywords: string[];
    topicSource: 'ai_ideation' | 'admin_queue';
    imagePrompt?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.title || !body.slug || !body.htmlContent) {
    return Response.json({ error: 'Missing required fields: title, slug, htmlContent' }, { status: 400 });
  }

  const db = getDB(env.DB)!;

  try {
    // Insert post as pending_review (no image yet)
    const [post] = await db.insert(posts).values({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || '',
      htmlContent: body.htmlContent,
      category: body.category || 'repair-tips',
      status: 'pending_review',
      aiGenerated: true,
      aiTopicSource: body.topicSource || 'ai_ideation',
    }).returning();

    // Insert keywords
    if (body.keywords?.length) {
      await db.insert(postKeywords).values(
        body.keywords.map((kw: string) => ({
          postId: post.id,
          keyword: kw,
        }))
      );
    }

    // Generate featured image from imagePrompt (same pattern as manual AI writer)
    let featuredImageId: number | null = null;
    if (body.imagePrompt) {
      try {
        console.log('[Draft API] Generating featured image...');
        const geminiKey = (env as any).GEMINI_API_KEY;
        if (geminiKey) {
          const genAI = new GoogleGenAI({ apiKey: geminiKey });
          const imageResponse = await genAI.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: body.imagePrompt,
            config: {
              imageConfig: {
                aspectRatio: '16:9',
              }
            }
          });

          let base64Image: string | null = null;
          let imageMimeType: string = 'image/jpeg';
          const firstCandidate = imageResponse.candidates?.[0];
          if (firstCandidate?.content?.parts) {
            for (const part of firstCandidate.content.parts) {
              if (part.inlineData?.data) {
                base64Image = part.inlineData.data;
                imageMimeType = part.inlineData.mimeType || 'image/jpeg';
                break;
              }
            }
          }

          if (base64Image) {
            const rawBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
            const filename = `${body.slug}.webp`;

            // Convert to real WebP using Cloudflare IMAGES binding (free tier)
            let finalBuffer: ArrayBuffer;
            try {
              console.log(`[Draft API] Converting ${imageMimeType} (${rawBuffer.length} bytes) → WebP via IMAGES binding...`);
              const blob = new Blob([rawBuffer], { type: imageMimeType });
              finalBuffer = await (env as any).IMAGES
                .input(blob.stream())
                .output({ format: 'image/webp', quality: 85 })
                .toArrayBuffer();
              console.log(`[Draft API] WebP conversion complete: ${rawBuffer.length} → ${finalBuffer.byteLength} bytes (${Math.round((1 - finalBuffer.byteLength / rawBuffer.length) * 100)}% smaller)`);
            } catch (convErr) {
              console.error('[Draft API] IMAGES conversion failed, storing raw:', convErr);
              finalBuffer = rawBuffer.buffer;
            }

            // Upload final WebP to R2
            await (env as any).MEDIA_BUCKET.put(`blog/${filename}`, finalBuffer, {
              httpMetadata: { contentType: 'image/webp' },
            });

            // Create media record in D1
            const [uploaded] = await db.insert(media).values({
              filename,
              mimeType: 'image/webp',
              filesize: finalBuffer.byteLength,
              alt: body.title,
              url: `/api/media/blog/${filename}`,
            }).returning();

            featuredImageId = uploaded.id;

            // Update post with featured image
            await db.update(posts)
              .set({ featuredImageId: featuredImageId })
              .where(eq(posts.id, post.id));

            console.log(`[Draft API] Featured image uploaded: ${filename} (ID: ${featuredImageId})`);
          }
        }
      } catch (imgErr) {
        console.error('[Draft API] Image generation failed (non-fatal):', imgErr);
      }
    }

    // Notify admins via Web Push
    try {
      const admins = await db.select({
        id: users.id,
        name: users.name,
      })
        .from(users)
        .where(eq(users.role, 'admin'));

      // Write in-app notification for each admin
      for (const admin of admins) {
        await db.insert(notifications).values({
          userId: admin.id,
          type: 'blog_draft',
          title: `New AI Draft: "${body.title}"`,
          body: 'An AI-generated blog post is ready for your review.',
          actionUrl: `/dashboard/posts/${post.id}`,
        });
      }

      // Send push notifications to ALL devices of ALL admins
      const adminIds = admins.map(a => a.id);
      if (adminIds.length > 0) {
        const { pushSubscriptions: pushSubsTable } = await import('@/db/schema');
        const { inArray } = await import('drizzle-orm');
        const allSubs = await db.select()
          .from(pushSubsTable)
          .where(inArray(pushSubsTable.userId, adminIds));

        for (const sub of allSubs) {
          try {
            const parsed = JSON.parse(sub.subscription);
            const result = await sendWebPush(
              parsed,
              JSON.stringify({
                title: '📝 New AI Draft Ready',
                body: `"${body.title}" needs your review`,
                url: `/dashboard/posts/${post.id}`,
              }),
              {
                vapidPublicKey: (env as any).VAPID_PUBLIC_KEY,
                vapidPrivateKey: (env as any).VAPID_PRIVATE_KEY,
                vapidSubject: (env as any).VAPID_SUBJECT || 'mailto:service@mobilgaragedoor.com',
              }
            );
            // Clean up expired subscriptions
            if (result.status === 410 || result.status === 404) {
              console.log(`[Draft API] Removing expired push sub ${sub.id}`);
              await db.delete(pushSubsTable).where(eq(pushSubsTable.id, sub.id));
            }
          } catch (pushErr) {
            console.error(`[Draft API] Push failed for sub ${sub.id}:`, pushErr);
          }
        }
      }
    } catch (notifyErr) {
      // Non-fatal: draft was saved, push just didn't send
      console.error('[Draft API] Admin notification error:', notifyErr);
    }

    return Response.json({ success: true, postId: post.id, featuredImageId }, { status: 201 });
  } catch (err: any) {
    console.error('[Draft API] Insert error:', err);
    return Response.json({ error: err.message || 'Failed to create draft' }, { status: 500 });
  }
}

