
/**
 * ------------------------------------------------------------------
 * STANDARD DATA CONTRACT: AI-Generated Blog Posts
 * ------------------------------------------------------------------
 * 
 * This contract defines the structure for AI-generated blog content.
 * Content is now stored as HTML strings (not Lexical JSON) since we
 * migrated from Payload CMS to Drizzle ORM.
 * 
 * @version 2.0.0 — Vinext Migration
 * @date 2026-03-01
 */

// 1. Root Structure
export interface AIPostResponse {
  title: string;
  excerpt: string;
  category: 'repair-tips' | 'product-spotlight' | 'contractor-insights' | 'maintenance-guide' | 'industry-news';
  keywords: string[];
  content: string; // HTML content
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
