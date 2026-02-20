'use server';

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { EXAMPLE_LEXICAL_STRUCTURE } from '@/lib/ai-contract';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

// --- Helper: Generic Generator ---
async function generateContent(systemPrompt: string, userPrompt: string, schema?: Schema, responseMimeType: string = 'application/json') {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash', // Upgraded to faster/cheaper model for 2026
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nTasks:\n${userPrompt}` }]
        }
      ],
      config: {
        responseMimeType,
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error('No content generated');
    
    return JSON.parse(text);
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
}

// --- Feature: Blog Post Generator ---
export async function generatePostContent(prompt: string, format: 'json' | 'markdown' = 'json'): Promise<any> {
    const markdownSchema: Schema = {
        type: Type.OBJECT,
        properties: {
        title: { type: Type.STRING },
        excerpt: { type: Type.STRING },
        category: { 
            type: Type.STRING, 
            enum: ['repair-tips', 'product-spotlight', 'contractor-insights', 'maintenance-guide', 'industry-news'] 
        },
        keywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
        },
        content: { type: Type.STRING },
        },
        required: ['title', 'excerpt', 'category', 'keywords', 'content'],
    };

    let systemPrompt = `
        You are an expert blog post writer for a Garage Door Service company.
        Generate a blog post based on the user's prompt.
    `;

    if (format === 'markdown') {
        systemPrompt += `
        The 'content' field must be a Markdown formatted string.
        Structure your response according to the schema.
        `;
    } else {
        systemPrompt += `
        You must return a JSON object with these fields:
        - title, excerpt, category, keywords
        - content: Lexical Editor State JSON Object (use 'heading', 'paragraph', 'list' nodes).
        
        Example Lexical Structure:
        ${JSON.stringify(EXAMPLE_LEXICAL_STRUCTURE, null, 2)}
        `;
    }

    return generateContent(systemPrompt, prompt, format === 'markdown' ? markdownSchema : undefined);
}

// --- Feature: Smart Email Drafts (Service Hero) ---
export interface EmailDraftOption {
    tone: 'Professional' | 'Empathetic' | 'Urgent';
    preview: string;
    content: string; // HTML ready for TipTap
}

export async function generateEmailDrafts(threadContext: { id: string, from: string, body: string, date: string }[]): Promise<EmailDraftOption[]> {
    const transcript = threadContext.map(msg => `[${msg.date}] ${msg.from}: ${msg.body}`).join('\n');

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            options: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        tone: { type: Type.STRING, enum: ['Professional', 'Empathetic', 'Urgent'] },
                        preview: { type: Type.STRING },
                        content: { type: Type.STRING },
                    },
                    required: ['tone', 'preview', 'content']
                }
            }
        },
        required: ['options']
    };

    const systemPrompt = `
        You are "Service Hero", a 20-year veteran Garage Door Technician and Support Specialist.
        Your goal is to draft replies to customer emails that are helpful, professional, and drive bookings.
        
        CONTEXT:
        ${transcript}
        
        INSTRUCTIONS:
        1. Analyze the conversation history strictly to understand the customer's issue and previous interactions.
        2. Generate 3 distinct draft replies in HTML format (suitable for a rich text editor):
           - Option 1 (Professional): Standard, courteous, scheduling-focused.
           - Option 2 (Empathetic): Apologetic (if needed), reassuring, comprehensive.
           - Option 3 (Urgent/Short): Quick acknowledgement, "we are on our way" or asking for critical info.
        
        FORMATTING:
        - Use <p> for paragraphs.
        - Use <ul>/<li> for lists.
        - Do NOT include <html> or <body> tags.
        - Sign off as "The Mobile Garage Door Team".
    `;

    const result = await generateContent(systemPrompt, "Draft 3 options based on the transcript.", schema);
    return result.options;
}

// --- Feature: Project Case Study Generator ---
export async function generateProjectCaseStudy(prompt: string) {
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'Catchy, professional title for the case study' },
            client: { type: Type.STRING, description: 'Type of client (e.g., "Luxury Residence", "Commercial Warehouse")' },
            location: { type: Type.STRING, description: 'City/Area (inferred or generic)' },
            description: { type: Type.STRING, description: 'Main narrative HTML' },
            challenge: { type: Type.STRING, description: 'Problem statement HTML' },
            solution: { type: Type.STRING, description: 'Solution details HTML' },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['title', 'client', 'location', 'description', 'challenge', 'solution', 'tags'],
    };

    const systemPrompt = `
        You are a Senior Project Manager for a high-end Garage Door Installation company.
        Create a detailed Case Study based on the user's rough notes.
        
        INSTRUCTIONS:
        1.  **Title:** compelling and descriptive.
        2.  **Client/Location:** Infer from context or use realistic placeholders (e.g. "Private Residence").
        3.  **Content (HTML):**
            -   **Description:** The main story. Use <p>, <b>, <ul>. Professional tone.
            -   **Challenge:** What was broken, difficult, or unique?
            -   **Solution:** What products/methods did we use? (e.g. "High-cycle springs", "Insulated steel panels").
        
        Ensure the HTML is clean (no <html>/<body> tags), just semantic block elements.
    `;

    return generateContent(systemPrompt, prompt, schema);
}
