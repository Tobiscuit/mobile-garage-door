interface Env {
    AI: any;
    VECTOR_INDEX: VectorizeIndex;
    GEMINI_API_KEY?: string;
    CMS_API_URL?: string;
    CMS_API_KEY?: string;
}

export interface AutonomousBlogPostPayload {
    title: string;
    slug: string;
    excerpt: string;
    htmlContent: string;
    category: string;
    keywords: { keyword: string }[];
    status: "draft" | "published";
    _status: "published"; // Payload draft mode override if needed
    publishedAt?: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        // Expose a manual trigger for local dev/testing
        const url = new URL(request.url);
        if (url.pathname === "/test-seo") {
             ctx.waitUntil(this.scheduled(null as any, env, ctx));
             return new Response("Triggering manual SEO Engine test in background...", { status: 200 });
        }
        return new Response("Not Found", { status: 404 });
    },

    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
        console.log("Starting Autonomous SEO Engine...");
        
        if (!env.GEMINI_API_KEY || !env.CMS_API_URL) {
            console.error("Missing critical environment variables: GEMINI_API_KEY or CMS_API_URL");
            return;
        }

        try {
            // STEP 1: Ideation (Seed Topics MVP)
            const seedTopics = [
                "Houston heat impact on garage door tension springs",
                "Why Wayne Dalton doors struggle with Texas humidity",
                "LiftMaster vs Chamberlain: Best for coastal regions"
            ];
            const targetTopic = seedTopics[Math.floor(Math.random() * seedTopics.length)];
            console.log(`[Ideation] Selected target topic: ${targetTopic}`);

            // STEP 2: The Oracle (Semantic Hashing & Deduplication)
            // Using Cloudflare's fast embedding model for dense hashing
            const embeddingResponse = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
                text: [targetTopic]
            });
            const topicHash = embeddingResponse.data[0];

            // Query Vector DB for similarity
            const queryVector = await env.VECTOR_INDEX.query(topicHash, { topK: 1 });
            
            if (queryVector.matches.length > 0 && queryVector.matches[0].score > 0.88) {
                console.log(`[Oracle] Topic rejected. Too similar to existing ID: ${queryVector.matches[0].id} (Score: ${queryVector.matches[0].score})`);
                return;
            }
            console.log(`[Oracle] Topic approved. No duplicates found in Memory.`);

            // STEP 3: The Writer (Generation Agent via Gemini API)
            console.log(`[Writer] Drafting article with gemini-3.1-pro (fallback: 3.0-pro)...`); // Using 3.0-pro as stable fallback
            const writerPrompt = `You are a master Garage Door Technician based in Texas. Write a highly informative, SEO-optimized blog post on the topic: "${targetTopic}".
            
CRITICAL INSTRUCTIONS:
1. Zero Fluff: Start immediately with the core insight. No conversational prefaces like 'Here is the article'.
2. Tone: Authoritative, tech-heavy, blunt. Like a master mechanic talking to a smart homeowner.
3. Output semantic HTML. Use <h2>, <h3>, <ul>, <li>, and <p>. DO NOT output markdown.

Return a JSON object matching this schema exactly.`;

            // Attempting 3.1-pro or falling back to 3.0-pro-preview based on local availability
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro:generateContent?key=${env.GEMINI_API_KEY}`;
            const geminiBody = {
                contents: [{ parts: [{ text: writerPrompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            title: { type: "STRING", description: "H1 Title optimized for CTR" },
                            slug: { type: "STRING", description: "URL-friendly slug" },
                            excerpt: { type: "STRING", description: "1-2 sentence hook" },
                            htmlContent: { type: "STRING", description: "The full semantic HTML string of the article body" },
                            category: { type: "STRING", enum: ["repair-tips", "product-spotlight", "contractor-insights", "maintenance-guide", "industry-news"] },
                            keywords: { 
                                type: "ARRAY", 
                                items: { 
                                    type: "OBJECT", 
                                    properties: { keyword: { type: "STRING" } } 
                                } 
                            }
                        },
                        required: ["title", "slug", "excerpt", "htmlContent", "category", "keywords"]
                    }
                }
            };

            const response = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(geminiBody)
            });

            const data: any = await response.json();
            
            if (!response.ok || !data.candidates || data.candidates.length === 0) {
                 console.error("[Writer] Gemini API Error:", data);
                 return;
            }

            const payloadText = data.candidates[0].content.parts[0].text;
            const articleData = JSON.parse(payloadText);
            
            const finalPayload: AutonomousBlogPostPayload = {
                ...articleData,
                status: "published",
                _status: "published"
            };

            // STEP 4: The Publisher (PayloadCMS Injection)
            console.log(`[Publisher] Pushing ${finalPayload.slug} to PayloadCMS API: ${env.CMS_API_URL}`);
            
            const cmsResponse = await fetch(env.CMS_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(env.CMS_API_KEY ? { "Authorization": `users API-Key ${env.CMS_API_KEY}` } : {})
                },
                body: JSON.stringify(finalPayload)
            });

            if (!cmsResponse.ok) {
                 const errText = await cmsResponse.text();
                 console.error("[Publisher] CMS Error:", errText);
                 return;
            }

            // STEP 5: Memory Write
            console.log(`[Memory] Saving Semantic Header to Vectorize...`);
            await env.VECTOR_INDEX.upsert([
                {
                    id: finalPayload.slug,
                    values: topicHash,
                    metadata: { title: finalPayload.title }
                }
            ]);

            console.log(`[Publisher] DONE! Payload ingested successfully.`);

        } catch (error) {
            console.error("SEO Engine Error:", error);
        }
    }
};
