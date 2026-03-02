/**
 * Auto-translate hook: writes translations to the translations table.
 *
 * When English content is saved (created or updated), this function:
 * 1. Detects which entity type was modified
 * 2. Translates specified fields using Google GenAI
 * 3. Inserts/updates rows in the translations table for 'es' and 'vi' locales
 *
 * Designed to run async — does not block the save operation.
 */
import { eq, and } from 'drizzle-orm';
import { getDB } from '@/db';
import { translations } from '@/db/schema';
import { translate } from '@/lib/translate-utils';

// Field definitions per entity type
const ENTITY_FIELDS: Record<string, Array<{ name: string; context: string }>> = {
  services: [
    { name: 'title', context: 'service name for a garage door company' },
    { name: 'description', context: 'service description for a garage door company' },
    { name: 'category', context: 'service category' },
  ],
  projects: [
    { name: 'title', context: 'project title for a garage door company' },
    { name: 'description', context: 'project case study description' },
    { name: 'challenge', context: 'project challenge description' },
    { name: 'solution', context: 'project solution description' },
  ],
  posts: [
    { name: 'title', context: 'blog post title' },
    { name: 'excerpt', context: 'blog post excerpt / summary' },
    { name: 'content', context: 'blog article content' },
  ],
  testimonials: [
    { name: 'quote', context: 'customer testimonial / review' },
    { name: 'location', context: 'location name' },
  ],
};

const TARGET_LOCALES = ['es', 'vi'] as const;

/**
 * Auto-translate an entity's fields and save to the translations table.
 *
 * @param d1 - The D1 database binding
 * @param entityType - The table name (e.g. 'services', 'projects')
 * @param entityId - The integer ID of the entity
 * @param entityData - The entity data object with field values
 */
export async function autoTranslateEntity(
  d1: D1Database,
  entityType: string,
  entityId: number,
  entityData: Record<string, any>
): Promise<void> {
  const fieldConfig = ENTITY_FIELDS[entityType];
  if (!fieldConfig) {
    console.log(`⏭ No translation config for entity type: ${entityType}`);
    return;
  }

  const db = getDB(d1);

  for (const targetLocale of TARGET_LOCALES) {
    console.log(`🌎 Auto-translating ${entityType}/${entityId} to ${targetLocale}...`);

    for (const { name, context } of fieldConfig) {
      const value = entityData[name];
      if (!value || typeof value !== 'string' || !value.trim()) continue;

      try {
        const translatedValue = await translate(value, context, targetLocale);

        // Upsert: check if translation exists, then insert or update
        const existing = await db
          .select()
          .from(translations)
          .where(
            and(
              eq(translations.entityType, entityType),
              eq(translations.entityId, entityId),
              eq(translations.fieldName, name),
              eq(translations.locale, targetLocale)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(translations)
            .set({
              value: translatedValue,
              autoTranslated: true,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(translations.id, existing[0].id));
        } else {
          await db.insert(translations).values({
            entityType,
            entityId,
            fieldName: name,
            locale: targetLocale,
            value: translatedValue,
            autoTranslated: true,
          });
        }
      } catch (err) {
        console.error(`❌ Translation failed for ${entityType}/${entityId}.${name} (${targetLocale}):`, err);
      }
    }

    console.log(`✅ ${targetLocale} translation saved for ${entityType}/${entityId}`);
  }
}
