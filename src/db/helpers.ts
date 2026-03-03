import { eq, and } from "drizzle-orm";
import { getDB } from "./index";
import { translations } from "./schema";

/**
 * Merges translated field values into a single entity for a given locale.
 * English content stays in the main table columns (default).
 * For 'es' or 'vi', this looks up overrides from the translations table.
 *
 * @param d1 - The D1 database binding
 * @param entity - A single row from a Drizzle select
 * @param entityType - The table name (e.g. 'services', 'projects', 'posts')
 * @param locale - The target locale ('en', 'es', or 'vi')
 * @returns The entity with translated fields merged in
 */
export async function withTranslation<T extends { id: number | string }>(
    d1: D1Database,
    entity: T,
    entityType: string,
    locale: string
): Promise<T> {
    // English is the default — no translation needed
    if (locale === "en" || !locale) return entity;

    const db = getDB(d1);
    const rows = await db
        .select()
        .from(translations)
        .where(
            and(
                eq(translations.entityType, entityType),
                eq(translations.entityId, typeof entity.id === "string" ? parseInt(entity.id, 10) : entity.id),
                eq(translations.locale, locale)
            )
        );

    if (rows.length === 0) return entity;

    // Create a copy and overlay translated fields
    const translated = { ...entity };
    for (const row of rows) {
        if (row.fieldName in translated) {
            (translated as any)[row.fieldName] = row.value;
        }
    }
    return translated;
}

/**
 * Merges translated field values into an array of entities for a given locale.
 * Batches the query for efficiency — one DB call for all entities.
 *
 * @param d1 - The D1 database binding
 * @param entities - Array of rows from a Drizzle select
 * @param entityType - The table name (e.g. 'services', 'projects', 'posts')
 * @param locale - The target locale ('en', 'es', or 'vi')
 * @returns The entities with translated fields merged in
 */
export async function withTranslations<T extends { id: number | string }>(
    d1: D1Database,
    entities: T[],
    entityType: string,
    locale: string
): Promise<T[]> {
    // English is the default — no translation needed
    if (locale === "en" || !locale || entities.length === 0) return entities;

    const db = getDB(d1);
    const rows = await db
        .select()
        .from(translations)
        .where(
            and(
                eq(translations.entityType, entityType),
                eq(translations.locale, locale)
            )
        );

    if (rows.length === 0) return entities;

    // Group translations by entity ID for fast lookup
    const translationMap = new Map<number, typeof rows>();
    for (const row of rows) {
        const existing = translationMap.get(row.entityId) || [];
        existing.push(row);
        translationMap.set(row.entityId, existing);
    }

    return entities.map((entity) => {
        const entityId = typeof entity.id === "string" ? parseInt(entity.id, 10) : entity.id;
        const entityTranslations = translationMap.get(entityId);
        if (!entityTranslations) return entity;

        const translated = { ...entity };
        for (const row of entityTranslations) {
            if (row.fieldName in translated) {
                (translated as any)[row.fieldName] = row.value;
            }
        }
        return translated;
    });
}
