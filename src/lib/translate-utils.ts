/**
 * Shared translation utilities for Payload CMS i18n
 * - translate(): Single text string translation via Gemini
 * - translateLexicalTree(): Deep-walks Lexical JSON AST, batches all text nodes into one API call
 */
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

// Singleton — don't create a new client per call
let _genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!_genAI) {
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    _genAI = new GoogleGenAI({ apiKey });
  }
  return _genAI;
}

// Delimiter for batching multiple strings into one API call
const BATCH_DELIMITER = '\n|||SPLIT|||\n';

function getLanguageName(locale: string): string {
  switch (locale) {
    case 'es': return 'Mexican Spanish';
    case 'vi': return 'Vietnamese';
    default: return locale;
  }
}

/**
 * Translate a single string from English to target language via Gemini
 */
export async function translate(text: string, context: string, targetLocale: string = 'es'): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  const genAI = getGenAI();
  const langName = getLanguageName(targetLocale);
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Translate the following ${context} from English to ${langName}.
The audience is Houston-area homeowners and contractors.
Keep it professional, natural, and culturally appropriate.
If the content contains HTML, preserve all HTML tags and structure exactly.
Do NOT add any explanations — return ONLY the translated text.

Content to translate:
${text}`,
  });

  return response.text?.trim() || text;
}

/**
 * Translate an entire Lexical JSON tree in-place.
 * Strategy: Collect all text nodes → batch translate in one API call → write back.
 * This minimizes API calls while preserving the exact tree structure.
 */
export async function translateLexicalTree(lexicalJSON: any, targetLocale: string = 'es'): Promise<any> {
  if (!lexicalJSON || typeof lexicalJSON !== 'object') return lexicalJSON;

  // Deep clone to avoid mutating the original
  const tree = JSON.parse(JSON.stringify(lexicalJSON));

  // 1. Collect all text node references and their text content
  const textNodes: Array<{ node: any; originalText: string }> = [];
  collectTextNodes(tree, textNodes);

  if (textNodes.length === 0) return tree;

  // 2. Batch all text into one Gemini call
  const allTexts = textNodes.map((n) => n.originalText);
  const batchInput = allTexts.join(BATCH_DELIMITER);

  const genAI = getGenAI();
  const langName = getLanguageName(targetLocale);
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Translate each of the following text segments from English to ${langName}.
The audience is Houston-area homeowners and contractors.
Keep it professional, natural, and culturally appropriate.
IMPORTANT: The segments are separated by "|||SPLIT|||". You MUST preserve these exact delimiters in your output.
Do NOT add explanations, numbering, or formatting — return ONLY the translated segments separated by the same "|||SPLIT|||" delimiter.
Return EXACTLY ${allTexts.length} segments.

${batchInput}`,
  });

  const resultText = response.text?.trim() || batchInput;
  const translatedParts = resultText.split('|||SPLIT|||').map((s: string) => s.trim());

  // 3. Write translations back into the tree nodes
  for (let i = 0; i < textNodes.length; i++) {
    // Fallback to original if the model returned fewer segments
    textNodes[i].node.text = translatedParts[i] || textNodes[i].originalText;
  }

  return tree;
}

/**
 * Recursively collect all text nodes from a Lexical AST
 */
function collectTextNodes(
  node: any,
  results: Array<{ node: any; originalText: string }>
): void {
  if (!node) return;

  // Lexical text nodes have type 'text' and a 'text' property
  if (node.type === 'text' && typeof node.text === 'string' && node.text.trim().length > 0) {
    results.push({ node, originalText: node.text });
  }

  // Recurse into children
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectTextNodes(child, results);
    }
  }

  // The root node has a special 'root' child in Lexical
  if (node.root && typeof node.root === 'object') {
    collectTextNodes(node.root, results);
  }
}

/**
 * Translate an array of items, translating specific string fields using a field map.
 * Example: translateArray(stats, { label: 'metric label', value: 'metric value' })
 */
export async function translateArray(
  items: Array<Record<string, any>> | undefined,
  fieldContextMap: Record<string, string>,
  targetLocale: string = 'es'
): Promise<Array<Record<string, any>> | undefined> {
  if (!items || items.length === 0) return items;

  const result = [];
  for (const item of items) {
    const { id, ...rest } = item;
    const translatedItem = { ...rest };
    for (const [field, context] of Object.entries(fieldContextMap)) {
      if (typeof item[field] === 'string' && item[field].trim()) {
        translatedItem[field] = await translate(item[field], context, targetLocale);
      }
    }
    result.push(translatedItem);
  }
  return result;
}
