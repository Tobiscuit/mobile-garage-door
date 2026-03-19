/**
 * SEO Engine — Autonomous Blog Pipeline
 * 
 * Cloudflare Worker with cron trigger that generates novel blog posts
 * using a three-phase ideation system:
 * 
 *   Phase 1: Landscape Scan — sample k existing topics from Vectorize (k = min(⌈3·log₂(n)⌉, n, 25))
 *   Phase 2: Steered Ideation — Gemini brainstorms 5 candidates informed by the landscape
 *   Phase 3: Novelty Verification — embed candidates, ANN query, pick most novel
 * 
 * Then writes the full article, saves as pending_review, and notifies admin.
 */

interface Env {
    AI: any;
    VECTOR_INDEX: VectorizeIndex;
    GEMINI_API_KEY: string;
    MAIN_APP_URL: string;
    MAIN_APP_API_KEY: string;
}

interface TopicCandidate {
    topic: string;
    category: string;
}

interface ArticlePayload {
    title: string;
    slug: string;
    excerpt: string;
    htmlContent: string;
    category: string;
    keywords: string[];
    imagePrompt: string;
}

// ─── Adaptive Sampling ─────────────────────────────────────────────
function computeSampleSize(totalVectors: number): number {
    if (totalVectors === 0) return 0;
    return Math.min(
        Math.ceil(3 * Math.log2(totalVectors)),
        totalVectors,
        25
    );
}

// ─── Gemini API Helper ─────────────────────────────────────────────
async function callGemini(
    apiKey: string,
    model: string,
    prompt: string,
    schema?: Record<string, any>
): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body: any = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: 'application/json',
            ...(schema ? { responseSchema: schema } : {}),
        },
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data: any = await res.json();
    if (!res.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error(`Gemini error: ${JSON.stringify(data.error || data)}`);
    }

    return JSON.parse(data.candidates[0].content.parts[0].text);
}

// ─── Main Worker ───────────────────────────────────────────────────
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url);
        if (url.pathname === '/test-seo') {
            try {
                await this.scheduled(null as any, env, ctx);
                return new Response('SEO Engine pipeline completed successfully.', { status: 200 });
            } catch (err: any) {
                return new Response(`SEO Engine error: ${err.message}`, { status: 500 });
            }
        }
        return new Response('Not Found', { status: 404 });
    },

    async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
        console.log('[SEO Engine] Starting autonomous blog pipeline...');

        if (!env.GEMINI_API_KEY || !env.MAIN_APP_URL || !env.MAIN_APP_API_KEY) {
            console.error('[SEO Engine] Missing env vars: GEMINI_API_KEY, MAIN_APP_URL, or MAIN_APP_API_KEY');
            return;
        }

        try {
            // ─── Phase 0: Check Topic Queue ────────────────────────
            // If admin queued topics, use the oldest one
            let chosenTopic: string | null = null;
            let topicSource: 'ai_ideation' | 'admin_queue' = 'ai_ideation';

            // Note: topic_queue is in the main app's D1, accessed via API
            // For now, we go straight to AI ideation. Admin queue requires
            // a GET endpoint on the main app (future enhancement).

            // ─── Phase 1: Landscape Scan ───────────────────────────
            // Step 1a: Fetch ALL existing titles from D1 (authoritative source)
            let existingTitles: string[] = [];
            let existingSlugs: string[] = [];
            try {
                console.log('[Phase 1] Fetching existing titles from D1...');
                const titlesRes = await fetch(`${env.MAIN_APP_URL}/api/blog/titles`, {
                    headers: { 'x-seo-engine-key': env.MAIN_APP_API_KEY },
                });
                if (titlesRes.ok) {
                    const data: any = await titlesRes.json();
                    existingTitles = data.titles || [];
                    existingSlugs = data.slugs || [];
                    console.log(`[Phase 1] Found ${existingTitles.length} existing posts in D1`);
                }
            } catch (err) {
                console.warn('[Phase 1] Could not fetch titles from D1, falling back to Vectorize only:', err);
            }

            // Step 1b: Also sample Vectorize for embedding-level dedup
            const indexInfo = await env.VECTOR_INDEX.describe();
            const totalVectors = indexInfo.vectorsCount ?? 0;
            const sampleSize = computeSampleSize(totalVectors);

            if (sampleSize > 0) {
                console.log(`[Phase 1] Scanning Vectorize: sampling ${sampleSize} of ${totalVectors} topics`);

                const randomVector = Array.from({ length: 384 }, () => Math.random() * 2 - 1);
                const sample = await env.VECTOR_INDEX.query(randomVector, {
                    topK: sampleSize,
                    returnMetadata: 'all',
                });

                // Merge Vectorize titles with D1 titles (deduped)
                const vectorTitles = sample.matches
                    .map(m => (m.metadata as any)?.title)
                    .filter(Boolean) as string[];
                
                const titleSet = new Set(existingTitles);
                for (const t of vectorTitles) {
                    if (!titleSet.has(t)) {
                        existingTitles.push(t);
                        titleSet.add(t);
                    }
                }
            } else {
                console.log('[Phase 1] Empty Vectorize index');
            }

            console.log(`[Phase 1] Total landscape: ${existingTitles.length} titles`);

            // ─── Phase 2: Steered Ideation ─────────────────────────
            const MAX_RETRIES = 3;
            let bestCandidate: TopicCandidate | null = null;
            let bestVector: number[] | null = null;
            let bestSimilarity = 1.0;

            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                const landscapeContext = existingTitles.length > 0
                    ? `\n\nWe have already published articles on these topics (DO NOT repeat or closely paraphrase any of them):\n${existingTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nGenerate topics that explore DIFFERENT areas, angles, or niches we haven't covered.`
                    : '';

                const nicheGuidance = attempt > 0
                    ? `\n\nPREVIOUS ATTEMPT FAILED — all topics were too similar to existing content. Go MORE NICHE. Think about specific products, seasonal issues, regional concerns, or unusual failure modes.`
                    : '';

                const ideationPrompt = `You are a master Garage Door Technician in Houston, Texas with 20 years of experience.
Brainstorm exactly 5 blog post topic ideas that would help homeowners and rank well in local SEO.

Topics should cover: repair tips, product comparisons, seasonal maintenance, safety, energy efficiency, or industry insights.
Each topic must be specific and actionable — not generic.${landscapeContext}${nicheGuidance}

Return a JSON array of exactly 5 objects.`;

                const ideationSchema = {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            topic: { type: 'STRING', description: 'Specific blog post topic' },
                            category: {
                                type: 'STRING',
                                enum: ['repair-tips', 'product-spotlight', 'contractor-insights', 'maintenance-guide', 'industry-news'],
                            },
                        },
                        required: ['topic', 'category'],
                    },
                };

                console.log(`[Phase 2] Ideation attempt ${attempt + 1}/${MAX_RETRIES}...`);
                const candidates: TopicCandidate[] = await callGemini(
                    env.GEMINI_API_KEY,
                    'gemini-3.1-pro-preview',
                    ideationPrompt,
                    ideationSchema
                );

                // ─── Phase 3: Novelty Verification ─────────────────
                console.log(`[Phase 3] Verifying novelty of ${candidates.length} candidates...`);

                // Embed all candidates
                const embeddingResponse = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
                    text: candidates.map(c => c.topic),
                });

                for (let i = 0; i < candidates.length; i++) {
                    const vector = embeddingResponse.data[i];
                    let maxSimilarity = 0;

                    if (totalVectors > 0) {
                        const queryResult = await env.VECTOR_INDEX.query(vector, { topK: 1 });
                        if (queryResult.matches.length > 0) {
                            maxSimilarity = queryResult.matches[0].score;
                        }
                    }

                    console.log(`  [${i + 1}] "${candidates[i].topic}" — similarity: ${maxSimilarity.toFixed(3)}`);

                    if (maxSimilarity < bestSimilarity) {
                        bestSimilarity = maxSimilarity;
                        bestCandidate = candidates[i];
                        bestVector = vector;
                    }
                }

                // If best candidate is novel enough, break (0.75 = stricter than 0.88)
                if (bestSimilarity < 0.75) {
                    console.log(`[Phase 3] Winner: "${bestCandidate!.topic}" (similarity: ${bestSimilarity.toFixed(3)})`);
                    break;
                }

                console.log(`[Phase 3] All candidates too similar (best: ${bestSimilarity.toFixed(3)}). Retrying...`);
            }

            // If no novel candidate found after retries, skip this cycle
            if (!bestCandidate || bestSimilarity >= 0.75) {
                console.log('[SEO Engine] Could not find novel topic after retries. Skipping this cycle.');
                return;
            }

            // ─── Phase 4: Write Article ────────────────────────────
            console.log(`[Writer] Drafting article on: "${bestCandidate.topic}"...`);

            const writerPrompt = `You are an expert blog writer for "Mobil Garage Door", a garage door service company based in Houston, Texas. Write a highly informative, SEO-optimized blog post on: "${bestCandidate.topic}".

CRITICAL INSTRUCTIONS:
1. Zero Fluff: Start immediately with the core insight. No conversational prefaces.
2. Tone: Professional but accessible. Write for smart homeowners, not engineers. Avoid overly technical jargon unless necessary, and explain any technical terms you do use.
3. Output semantic HTML. Use <h2>, <h3>, <ul>, <li>, and <p>. DO NOT output markdown.
4. Length: 800-1200 words of substantive content.
5. Include specific product names or practical tips where relevant.
6. End with a clear call-to-action mentioning Mobil Garage Door. Do NOT add "Pros" or any other word after the company name.
7. Provide a highly detailed 'imagePrompt' that will be used to generate a photorealistic 16:9 featured hero image for this blog post. Describe the scene, lighting, objects, and mood. Do NOT include any text or words in the image.`;

            const articleSchema = {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING', description: 'H1 Title optimized for CTR and local SEO' },
                    slug: { type: 'STRING', description: 'URL-friendly slug' },
                    excerpt: { type: 'STRING', description: '1-2 sentence hook for meta description' },
                    htmlContent: { type: 'STRING', description: 'Full semantic HTML article body' },
                    category: {
                        type: 'STRING',
                        enum: ['repair-tips', 'product-spotlight', 'contractor-insights', 'maintenance-guide', 'industry-news'],
                    },
                    imagePrompt: { type: 'STRING', description: 'Detailed prompt for generating a photorealistic 16:9 featured image' },
                    keywords: {
                        type: 'ARRAY',
                        items: { type: 'STRING' },
                    },
                },
                required: ['title', 'slug', 'excerpt', 'htmlContent', 'category', 'keywords', 'imagePrompt'],
            };

            const article: ArticlePayload = await callGemini(
                env.GEMINI_API_KEY,
                'gemini-3.1-pro-preview',
                writerPrompt,
                articleSchema
            );

            // ─── Phase 5: Publish Draft ────────────────────────────
            console.log(`[Publisher] Sending "${article.slug}" to ${env.MAIN_APP_URL}/api/blog/draft...`);

            const draftResponse = await fetch(`${env.MAIN_APP_URL}/api/blog/draft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-seo-engine-key': env.MAIN_APP_API_KEY,
                },
                body: JSON.stringify({
                    ...article,
                    topicSource: topicSource,
                }),
            });

            if (!draftResponse.ok) {
                const errText = await draftResponse.text();
                console.error('[Publisher] Draft API error:', errText);
                return;
            }

            const draftResult: any = await draftResponse.json();
            console.log(`[Publisher] Draft saved! Post ID: ${draftResult.postId}`);

            // ─── Phase 6: Memory Write ─────────────────────────────
            console.log('[Memory] Upserting topic vector to Vectorize...');
            await env.VECTOR_INDEX.upsert([
                {
                    id: article.slug,
                    values: bestVector!,
                    metadata: {
                        title: article.title,
                        category: article.category,
                        createdAt: new Date().toISOString(),
                    },
                },
            ]);

            console.log('[SEO Engine] Pipeline complete! Draft ready for HITL review.');

        } catch (error) {
            console.error('[SEO Engine] Fatal error:', error);
        }
    },
};
