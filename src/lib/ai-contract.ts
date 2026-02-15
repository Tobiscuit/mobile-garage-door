
import { type SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';

/**
 * ------------------------------------------------------------------
 * STANDARD DATA CONTRACT: AI-Generated Blog Posts (Lexical JSON)
 * ------------------------------------------------------------------
 * 
 * This contract defines the strict JSON structure required by Payload CMS's 
 * Lexical RichText editor. AI models must output content adhering to this 
 * schema to ensure it renders correctly in the Admin UI and Frontend.
 * 
 * @version 1.0.0
 * @date 2026-02-14
 */

// 1. Root Structure
export interface AIPostResponse {
  title: string;
  excerpt: string;
  category: 'repair-tips' | 'product-spotlight' | 'contractor-insights' | 'maintenance-guide' | 'industry-news';
  keywords: string[]; // Array of strings, e.g. ["Garage Door Spring", "DIY Repair"]
  content: SerializedEditorState; // The Lexical JSON payload
}

// 2. Lexical Node Types (Simplified for AI Instruction)
// AI should construct the 'content' field using this structure:

/*
{
  "root": {
    "type": "root",
    "format": "",
    "indent": 0,
    "version": 1,
    "children": [
      // ... Block Nodes go here (Headings, Paragraphs, Lists) ...
    ]
  }
}
*/

/**
 * HELPER: Example of a valid Lexical JSON for AI to replicate.
 * Pass this example to the LLM as a "Few-Shot" prompt.
 */
export const EXAMPLE_LEXICAL_STRUCTURE = {
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "heading",
        tag: "h2",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "Why Your Garage Door Won't Close",
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
            version: 1
          }
        ],
        direction: "ltr"
      },
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "The most common reason is misaligned safety sensors. Check for dirt or cobwebs.",
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
            version: 1
          }
        ],
        direction: "ltr"
      },
      {
        type: "list",
        listType: "bullet",
        start: 1,
        tag: "ul",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "listitem",
            format: "",
            indent: 0,
            version: 1,
            children: [
               {
                 type: "text",
                 text: "Check the green light on the receiving sensor.",
                 format: 0,
                 detail: 0,
                 mode: "normal",
                 style: "",
                 version: 1
               }
            ],
            direction: "ltr"
          }
        ],
        direction: "ltr"
      }
    ],
    direction: "ltr"
  }
};
