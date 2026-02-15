'use server';

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { EXAMPLE_LEXICAL_STRUCTURE } from '@/lib/ai-contract';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

export async function generatePostContent(prompt: string, format: 'json' | 'markdown' = 'json'): Promise<any> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  // Define schema for Markdown (Custom Dashboard)
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
    const response = await genAI.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Prompt: ${prompt}` }]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: format === 'markdown' ? markdownSchema : undefined,
      },
    });

    const text = response.text;
    console.log('AI Response:', text);
    
    if (!text) {
      throw new Error('No content generated');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
}
