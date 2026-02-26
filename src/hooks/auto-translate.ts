/**
 * Payload afterChange Hook: Auto-translate content to Spanish
 *
 * When English content is saved (created or updated), this hook:
 * 1. Detects which collection was modified
 * 2. Translates all localized fields (text, Lexical JSON, HTML, arrays)
 * 3. Saves the translated version via payload.update({ locale: targetLocale })
 *
 * Runs async in background — does not block the admin save.
 */
import type { CollectionAfterChangeHook } from 'payload';
import { translate, translateLexicalTree, translateArray } from '@/lib/translate-utils';

// Field definitions per collection
const COLLECTION_FIELDS: Record<string, {
  textFields?: Array<{ name: string; context: string }>;
  richTextFields?: string[];
  htmlFields?: Array<{ name: string; context: string }>;
  arrayFields?: Array<{ name: string; fieldMap: Record<string, string> }>;
}> = {
  projects: {
    textFields: [
      { name: 'title', context: 'project title' },
      { name: 'client', context: 'client type description' },
    ],
    richTextFields: ['description', 'challenge', 'solution'],
    htmlFields: [
      { name: 'htmlDescription', context: 'project case study HTML content' },
      { name: 'htmlChallenge', context: 'project challenge HTML content' },
      { name: 'htmlSolution', context: 'project solution HTML content' },
    ],
    arrayFields: [
      { name: 'stats', fieldMap: { label: 'metric label', value: 'metric value' } },
    ],
  },
  posts: {
    textFields: [
      { name: 'title', context: 'blog post title' },
      { name: 'excerpt', context: 'blog post excerpt / summary' },
    ],
    richTextFields: ['content'],
    htmlFields: [
      { name: 'htmlContent', context: 'blog article HTML content' },
    ],
  },
  services: {
    textFields: [
      { name: 'title', context: 'service name' },
      { name: 'category', context: 'service category' },
      { name: 'description', context: 'service description' },
    ],
    arrayFields: [
      { name: 'features', fieldMap: { feature: 'service feature bullet point' } },
    ],
  },
  testimonials: {
    textFields: [
      { name: 'quote', context: 'customer testimonial / review' },
      { name: 'location', context: 'location name' },
    ],
  },
};

export const autoTranslateHook: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  collection,
}) => {
  // Only translate on create/update of English content
  if (operation !== 'create' && operation !== 'update') return doc;

  // Check if this is a Spanish save (avoid infinite loop)
  const locale = req.locale || 'en';
  if (locale !== 'en') return doc;

  // Don't block the main request — translate in background
  const collectionSlug = collection.slug;
  const fieldConfig = COLLECTION_FIELDS[collectionSlug];
  if (!fieldConfig) return doc;

  // Fire and forget — don't await, don't block the admin UI
  const targetLocales = ['es', 'vi'];
  for (const targetLocale of targetLocales) {
    translateInBackground(doc, collectionSlug, fieldConfig, req.payload, targetLocale).catch((err) => {
      req.payload.logger.error({ err }, `Auto-translation failed for ${collectionSlug}/${doc.id} (${targetLocale})`);
    });
  }

  return doc;
};

async function translateInBackground(
  doc: any,
  collectionSlug: string,
  fieldConfig: typeof COLLECTION_FIELDS[string],
  payload: any,
  targetLocale: string
) {
  payload.logger.info(`🌎 Auto-translating ${collectionSlug}/${doc.id} to ${targetLocale}...`);

  const updateData: Record<string, any> = {};

  // 1. Translate plain text fields
  if (fieldConfig.textFields) {
    for (const { name, context } of fieldConfig.textFields) {
      if (doc[name] && typeof doc[name] === 'string' && doc[name].trim()) {
        updateData[name] = await translate(doc[name], context, targetLocale);
      }
    }
  }

  // 2. Translate Lexical richText fields (deep tree walk)
  if (fieldConfig.richTextFields) {
    for (const fieldName of fieldConfig.richTextFields) {
      if (doc[fieldName] && typeof doc[fieldName] === 'object') {
        updateData[fieldName] = await translateLexicalTree(doc[fieldName], targetLocale);
      }
    }
  }

  // 3. Translate HTML code fields
  if (fieldConfig.htmlFields) {
    for (const { name, context } of fieldConfig.htmlFields) {
      if (doc[name] && typeof doc[name] === 'string' && doc[name].trim()) {
        updateData[name] = await translate(doc[name], context, targetLocale);
      }
    }
  }

  // 4. Translate array fields
  if (fieldConfig.arrayFields) {
    for (const { name, fieldMap } of fieldConfig.arrayFields) {
      if (doc[name] && Array.isArray(doc[name]) && doc[name].length > 0) {
        updateData[name] = await translateArray(doc[name], fieldMap, targetLocale);
      }
    }
  }

  // Only update if we have fields to translate
  if (Object.keys(updateData).length === 0) {
    payload.logger.info(`  ⏭ No translatable fields found, skipping.`);
    return;
  }

  // Save the translated version
  await payload.update({
    collection: collectionSlug,
    id: doc.id,
    locale: targetLocale as any,
    data: updateData,
  });

  payload.logger.info(`  ✅ ${targetLocale} translation saved for ${collectionSlug}/${doc.id} (${Object.keys(updateData).length} fields)`);
}
