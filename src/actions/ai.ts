'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIPostResponse } from '@/lib/ai-contract';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash', // Bleeding edge model
  generationConfig: {
    responseMimeType: 'application/json',
  },
});

export async function generatePostContent(prompt: string, format: 'json' | 'markdown' = 'json'): Promise<any> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  let systemPrompt = `
    You are an expert blog post writer for a Garage Door Service company.
    Generate a blog post based on the user's prompt.
    
    You must return a JSON object.
    
    Common fields:
    - title: string
    - excerpt: string
    - category: 'repair-tips' | 'product-spotlight' | 'contractor-insights' | 'maintenance-guide' | 'industry-news'
    - keywords: string[]
  `;

  if (format === 'markdown') {
    systemPrompt += `
    - content: string (Markdown format)

    Example JSON structure:
    {
      "title": "...",
      "excerpt": "...",
      "category": "...",
      "keywords": ["..."],
      "content": "# Heading\n\nParagraph text..."
    }
    `;
  } else {
    systemPrompt += `
    - content: Lexical Editor State JSON Object

    interface AIPostResponse {
      title: string;
      excerpt: string;
      category: 'repair-tips' | 'product-spotlight' | 'contractor-insights' | 'maintenance-guide' | 'industry-news';
      keywords: string[];
      content: {
        root: {
          children: Array<any>;
          // ... Standard Lexical Root
        };
      };
    }

    For the 'content' field, you must generate a valid Lexical Editor State JSON.
    Use 'heading' nodes for titles (h2, h3), 'paragraph' nodes for text, and 'list' nodes for bullet points.
    Ensure the JSON structure is valid for Payload CMS Lexical Editor.
    
    Example of a paragraph node in Lexical:
    {
      "type": "paragraph",
      "format": "",
      "indent": 0,
      "version": 1,
      "children": [
        {
          "type": "text",
          "text": "Your text content here",
          "format": 0,
          "detail": 0,
          "mode": "normal",
          "style": "",
          "version": 1
        }
      ],
      "direction": "ltr"
    }
    `;
  }

  systemPrompt += `\nMake the content engaging, SEO-optimized, and professional.`;

  const result = await model.generateContent(`${systemPrompt}\n\nUser Prompt: ${prompt}`);
  const response = result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Failed to generate valid JSON content');
  }
}
