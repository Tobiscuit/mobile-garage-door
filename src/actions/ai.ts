'use server';

import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';
import { EXAMPLE_LEXICAL_STRUCTURE } from '@/lib/ai-contract';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

export async function generatePostContent(prompt: string, format: 'json' | 'markdown' = 'json'): Promise<any> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  // Define schema for Markdown (Custom Dashboard)
  const markdownSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING },
      excerpt: { type: SchemaType.STRING },
      category: { 
        type: SchemaType.STRING, 
        enum: ['repair-tips', 'product-spotlight', 'contractor-insights', 'maintenance-guide', 'industry-news'] 
      },
      keywords: { 
        type: SchemaType.ARRAY, 
        items: { type: SchemaType.STRING } 
      },
      content: { type: SchemaType.STRING },
    },
    required: ['title', 'excerpt', 'category', 'keywords', 'content'],
  };

  // Initialize model with specific config based on format
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: format === 'markdown' ? markdownSchema : undefined,
    },
  });

  let systemPrompt = `
    You are an expert blog post writer for a Garage Door Service company.
    Generate a blog post based on the user's prompt.
  `;

  if (format === 'markdown') {
    systemPrompt += `
    The 'content' field must be a Markdown formatted string.
    
    Structure your response according to the schema:
    - title: Catchy SEO title
    - excerpt: Brief summary (1-2 sentences)
    - category: One of the allowed values
    - keywords: Array of SEO keywords
    - content: Full blog post in Markdown (headings, lists, bold, etc.)
    `;
  } else {
    systemPrompt += `
    You must return a JSON object with these fields:
    - title: string
    - excerpt: string
    - category: 'repair-tips' | 'product-spotlight' | 'contractor-insights' | 'maintenance-guide' | 'industry-news'
    - keywords: string[]
    - content: Lexical Editor State JSON Object

    For the 'content' field, you must generate a valid Lexical Editor State JSON.
    Use 'heading' nodes for titles (h2, h3), 'paragraph' nodes for text, and 'list' nodes for bullet points.
    Ensure the JSON structure is valid for Payload CMS Lexical Editor.
    
    Here is an example of the expected Lexical JSON structure for the 'content' field (use this as a template):
    ${JSON.stringify(EXAMPLE_LEXICAL_STRUCTURE, null, 2)}
    `;
  }

  systemPrompt += `\nMake the content engaging, SEO-optimized, and professional.`;

  try {
    const result = await model.generateContent(`${systemPrompt}\n\nUser Prompt: ${prompt}`);
    const response = result.response;
    const text = response.text();
    console.log('AI Response:', text);
    return JSON.parse(text);
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
}
