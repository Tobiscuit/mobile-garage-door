#!/usr/bin/env node
/**
 * Supabase → D1 Migration Script
 *
 * Reads supabase_data.sql (Postgres INSERT statements) and produces
 * d1_seed.sql (SQLite-compatible INSERT statements for the Drizzle schema).
 *
 * Key mappings:
 *   - posts_locales (en rows)     → posts.title / excerpt / content / html_content
 *   - posts_locales (es/vi rows)  → translations table
 *   - projects_locales (en rows)  → projects columns
 *   - projects_locales (es/vi)    → translations table
 *   - services_locales (en rows)  → services.title / category / description
 *   - services_locales (es/vi)    → translations table
 *   - testimonials_locales (en)   → testimonials.quote / location
 *   - testimonials_locales (es/vi)→ translations table
 *   - settings                    → settings (singleton row)
 *   - users                       → users (UUID ids become text ids)
 *   - media, payments, service_requests, staff_invites → direct mapping
 *   - posts_keywords              → post_keywords
 *   - projects_tags               → project_tags
 *   - projects_stats              → project_stats (en only)
 *   - services_features           → service_features (en only)
 */

import fs from 'fs';

const dump = fs.readFileSync('supabase_data.sql', 'utf8');
const lines = [];
let translationId = 1;

// ─── Helpers ──────────────────────────────────────────────────────────

/** Parse a Postgres INSERT block into { cols, rows } */
function parseInsert(tableName) {
    // Match:  INSERT OR IGNORE INTO "public"."tableName" (<cols>) VALUES\n  <rows>;
    const escaped = tableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(
        `INSERT OR IGNORE INTO "public"\\."${escaped}" \\(([^)]+)\\) VALUES\\s*\\n([\\s\\S]*?);`,
        'm'
    );
    const m = dump.match(re);
    if (!m) return null;

    const cols = m[1].split(',').map(c => c.trim().replace(/"/g, ''));
    const rawRows = m[2];

    // Split rows on top-level "),\n\t(" boundaries while respecting quoted strings
    const rows = [];
    let depth = 0, inStr = false, cur = '';
    for (let i = 0; i < rawRows.length; i++) {
        const ch = rawRows[i];
        if (ch === "'" && !inStr) { inStr = true; cur += ch; continue; }
        if (ch === "'" && inStr) {
            if (rawRows[i + 1] === "'") { cur += "''"; i++; continue; }
            inStr = false; cur += ch; continue;
        }
        if (inStr) { cur += ch; continue; }
        if (ch === '(') { depth++; if (depth === 1) { cur = ''; continue; } }
        if (ch === ')') {
            depth--;
            if (depth === 0) {
                rows.push(parseRowValues(cur, cols));
                cur = '';
                continue;
            }
        }
        if (depth > 0) cur += ch;
    }

    return { cols, rows };
}

/** Parse a single row's comma-separated values respecting SQL quoting */
function parseRowValues(raw, cols) {
    const values = [];
    let cur = '', inStr = false;
    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (ch === "'" && !inStr) { inStr = true; cur += ch; continue; }
        if (ch === "'" && inStr) {
            if (raw[i + 1] === "'") { cur += "''"; i++; continue; }
            inStr = false; cur += ch; continue;
        }
        if (ch === ',' && !inStr) { values.push(cur.trim()); cur = ''; continue; }
        cur += ch;
    }
    values.push(cur.trim());

    const obj = {};
    cols.forEach((c, idx) => { obj[c] = values[idx] ?? 'NULL'; });
    return obj;
}

/** Escape a value for SQLite (keep quoted strings as-is, map booleans) */
function v(val) {
    if (!val || val === 'NULL' || val === 'null') return 'NULL';
    if (val === 'true') return '1';
    if (val === 'false') return '0';
    if (String(val).startsWith("'") && String(val).endsWith("'")) return val;
    return val;
}

/** Force a value to be quoted as a string (for TEXT IDs) */
function vText(val) {
    if (!val || val === 'NULL' || val === 'null') return 'NULL';
    if (val.startsWith("'") && val.endsWith("'")) return val;
    return `'${val}'`;
}

/** Strip Postgres TZ suffix from timestamps: '2026-02-28 17:16:32.327+00' → '2026-02-28T17:16:32.327Z' */
function ts(val) {
    if (!val || val === 'NULL') return 'NULL';
    // Remove surrounding quotes, clean, re-quote
    const inner = val.replace(/^'|'$/g, '').replace(/\+00$/, 'Z').replace(' ', 'T');
    return `'${inner}'`;
}

function emit(sql) { lines.push(sql); }

// ─── 1. Users (Skipped - User requested fresh start) ────────────────────

// ─── 2. Media ─────────────────────────────────────────────────────────
const media = parseInsert('media');
if (media) {
    emit('-- ═══ MEDIA ═══');
    for (const r of media.rows) {
        emit(`INSERT OR IGNORE INTO media (id, filename, mime_type, filesize, width, height, alt, url, created_at, updated_at) VALUES (${v(r.id)}, ${v(r.filename)}, ${v(r.mime_type)}, ${v(r.filesize)}, ${v(r.width)}, ${v(r.height)}, ${v(r.alt)}, ${v(r.url)}, ${ts(r.created_at)}, ${ts(r.updated_at)});`);
    }
    emit('');
}

// ─── 3. Services (base) ──────────────────────────────────────────────
const services = parseInsert('services');
const servicesLocales = parseInsert('services_locales');
if (services) {
    emit('-- ═══ SERVICES ═══');
    for (const r of services.rows) {
        // Find English locale row for this service
        const en = servicesLocales?.rows.find(lr => lr._parent_id === r.id && lr._locale === "'en'");
        const title = en ? v(en.title) : "''";
        const category = en ? v(en.category) : 'NULL';
        const description = en ? v(en.description) : 'NULL';
        emit(`INSERT OR IGNORE INTO services (id, title, slug, category, price, description, icon, highlight, "order", created_at, updated_at) VALUES (${v(r.id)}, ${title}, ${v(r.slug)}, ${category}, ${v(r.price)}, ${description}, ${v(r.icon)}, ${v(r.highlight)}, ${v(r.order)}, ${ts(r.created_at)}, ${ts(r.updated_at)});`);
    }
    emit('');

    // Translations for services (es, vi)
    if (servicesLocales) {
        emit('-- ═══ SERVICE TRANSLATIONS ═══');
        for (const lr of servicesLocales.rows) {
            const locale = lr._locale?.replace(/'/g, '');
            if (locale === 'en') continue;
            const entityId = lr._parent_id;
            for (const [field, val] of [['title', lr.title], ['category', lr.category], ['description', lr.description]]) {
                if (val && val !== 'NULL') {
                    emit(`INSERT OR IGNORE INTO translations (id, entity_type, entity_id, field_name, locale, value, auto_translated, created_at, updated_at) VALUES (${translationId++}, 'services', ${entityId}, '${field}', '${locale}', ${v(val)}, 0, datetime('now'), datetime('now'));`);
                }
            }
        }
        emit('');
    }
}

// ─── 4. Service Features ─────────────────────────────────────────────
const servicesFeatures = parseInsert('services_features');
if (servicesFeatures) {
    emit('-- ═══ SERVICE FEATURES ═══');
    for (const r of servicesFeatures.rows) {
        const locale = r._locale?.replace(/'/g, '');
        if (locale && locale !== 'en') continue; // only English features into D1
        emit(`INSERT OR IGNORE INTO service_features (service_id, feature, "order") VALUES (${v(r._parent_id)}, ${v(r.feature)}, ${v(r._order)});`);
    }
    emit('');
}

// ─── 5. Projects (base) ──────────────────────────────────────────────
const projects = parseInsert('projects');
const projectsLocales = parseInsert('projects_locales');
if (projects) {
    emit('-- ═══ PROJECTS ═══');
    for (const r of projects.rows) {
        const en = projectsLocales?.rows.find(lr => lr._parent_id === r.id && lr._locale === "'en'");
        const title = en ? v(en.title) : "''";
        const client = en ? v(en.client) : 'NULL';
        const description = en ? v(en.description) : 'NULL';
        const challenge = en ? v(en.challenge) : 'NULL';
        const solution = en ? v(en.solution) : 'NULL';
        const htmlDesc = en ? v(en.html_description) : 'NULL';
        const htmlChal = en ? v(en.html_challenge) : 'NULL';
        const htmlSol = en ? v(en.html_solution) : 'NULL';
        emit(`INSERT OR IGNORE INTO projects (id, title, slug, client, location, completion_date, install_date, warranty_expiration, description, challenge, solution, html_description, html_challenge, html_solution, image_style, created_at, updated_at) VALUES (${v(r.id)}, ${title}, ${v(r.slug)}, ${client}, ${v(r.location)}, ${ts(r.completion_date)}, ${ts(r.install_date)}, ${ts(r.warranty_expiration)}, ${description}, ${challenge}, ${solution}, ${htmlDesc}, ${htmlChal}, ${htmlSol}, ${v(r.image_style)}, ${ts(r.created_at)}, ${ts(r.updated_at)});`);
    }
    emit('');

    if (projectsLocales) {
        emit('-- ═══ PROJECT TRANSLATIONS ═══');
        for (const lr of projectsLocales.rows) {
            const locale = lr._locale?.replace(/'/g, '');
            if (locale === 'en') continue;
            const entityId = lr._parent_id;
            for (const [field, val] of [
                ['title', lr.title], ['client', lr.client], ['description', lr.description],
                ['challenge', lr.challenge], ['solution', lr.solution],
                ['html_description', lr.html_description], ['html_challenge', lr.html_challenge], ['html_solution', lr.html_solution]
            ]) {
                if (val && val !== 'NULL') {
                    emit(`INSERT OR IGNORE INTO translations (id, entity_type, entity_id, field_name, locale, value, auto_translated, created_at, updated_at) VALUES (${translationId++}, 'projects', ${entityId}, '${field}', '${locale}', ${v(val)}, 0, datetime('now'), datetime('now'));`);
                }
            }
        }
        emit('');
    }
}

// ─── 6. Project Tags, Stats ──────────────────────────────────────────
const projectTags = parseInsert('projects_tags');
if (projectTags) {
    emit('-- ═══ PROJECT TAGS ═══');
    for (const r of projectTags.rows) {
        emit(`INSERT OR IGNORE INTO project_tags (project_id, tag) VALUES (${v(r._parent_id)}, ${v(r.tag)});`);
    }
    emit('');
}

const projectStats = parseInsert('projects_stats');
if (projectStats) {
    emit('-- ═══ PROJECT STATS ═══');
    for (const r of projectStats.rows) {
        const locale = r._locale?.replace(/'/g, '');
        if (locale && locale !== 'en') continue;
        emit(`INSERT OR IGNORE INTO project_stats (project_id, label, value) VALUES (${v(r._parent_id)}, ${v(r.label)}, ${v(r.value)});`);
    }
    emit('');
}

// ─── 7. Posts (base) ──────────────────────────────────────────────────
const posts = parseInsert('posts');
const postsLocales = parseInsert('posts_locales');
if (posts) {
    emit('-- ═══ POSTS ═══');
    for (const r of posts.rows) {
        const en = postsLocales?.rows.find(lr => lr._parent_id === r.id && lr._locale === "'en'");
        const title = en ? v(en.title) : "''";
        const excerpt = en ? v(en.excerpt) : 'NULL';
        const content = en ? v(en.content) : 'NULL';
        const htmlContent = en ? v(en.html_content) : 'NULL';
        emit(`INSERT OR IGNORE INTO posts (id, title, slug, excerpt, content, html_content, featured_image_id, category, published_at, status, quick_notes, created_at, updated_at) VALUES (${v(r.id)}, ${title}, ${v(r.slug)}, ${excerpt}, ${content}, ${htmlContent}, ${v(r.featured_image_id)}, ${v(r.category)}, ${ts(r.published_at)}, ${v(r.status)}, ${v(r.quick_notes)}, ${ts(r.created_at)}, ${ts(r.updated_at)});`);
    }
    emit('');

    if (postsLocales) {
        emit('-- ═══ POST TRANSLATIONS ═══');
        for (const lr of postsLocales.rows) {
            const locale = lr._locale?.replace(/'/g, '');
            if (locale === 'en') continue;
            const entityId = lr._parent_id;
            for (const [field, val] of [
                ['title', lr.title], ['excerpt', lr.excerpt], ['content', lr.content], ['html_content', lr.html_content]
            ]) {
                if (val && val !== 'NULL') {
                    emit(`INSERT OR IGNORE INTO translations (id, entity_type, entity_id, field_name, locale, value, auto_translated, created_at, updated_at) VALUES (${translationId++}, 'posts', ${entityId}, '${field}', '${locale}', ${v(val)}, 0, datetime('now'), datetime('now'));`);
                }
            }
        }
        emit('');
    }
}

// ─── 8. Post Keywords ────────────────────────────────────────────────
const postsKeywords = parseInsert('posts_keywords');
if (postsKeywords) {
    emit('-- ═══ POST KEYWORDS ═══');
    for (const r of postsKeywords.rows) {
        emit(`INSERT OR IGNORE INTO post_keywords (post_id, keyword) VALUES (${v(r._parent_id)}, ${v(r.keyword)});`);
    }
    emit('');
}

// ─── 9. Testimonials ─────────────────────────────────────────────────
const testimonials = parseInsert('testimonials');
const testimonialsLocales = parseInsert('testimonials_locales');
if (testimonials) {
    emit('-- ═══ TESTIMONIALS ═══');
    for (const r of testimonials.rows) {
        const en = testimonialsLocales?.rows.find(lr => lr._parent_id === r.id && lr._locale === "'en'");
        const quote = en ? v(en.quote) : "''";
        const location = en ? v(en.location) : "''";
        emit(`INSERT OR IGNORE INTO testimonials (id, quote, author, location, rating, featured, created_at, updated_at) VALUES (${v(r.id)}, ${quote}, ${v(r.author)}, ${location}, ${v(r.rating)}, ${v(r.featured)}, ${ts(r.created_at)}, ${ts(r.updated_at)});`);
    }
    emit('');

    if (testimonialsLocales) {
        emit('-- ═══ TESTIMONIAL TRANSLATIONS ═══');
        for (const lr of testimonialsLocales.rows) {
            const locale = lr._locale?.replace(/'/g, '');
            if (locale === 'en') continue;
            const entityId = lr._parent_id;
            for (const [field, val] of [['quote', lr.quote], ['location', lr.location]]) {
                if (val && val !== 'NULL') {
                    emit(`INSERT OR IGNORE INTO translations (id, entity_type, entity_id, field_name, locale, value, auto_translated, created_at, updated_at) VALUES (${translationId++}, 'testimonials', ${entityId}, '${field}', '${locale}', ${v(val)}, 0, datetime('now'), datetime('now'));`);
                }
            }
        }
        emit('');
    }
}

// ─── 10. Payments (Skipped - Legacy Test Data) ───────────────

// ─── 11. Service Requests (Skipped - Legacy Test Data) ───────

// ─── 12. Staff Invites (Skipped - Legacy Test Data) ──────────

// ─── 13. Settings (singleton) ────────────────────────────────────────
const settings = parseInsert('settings');
if (settings) {
    emit('-- ═══ SETTINGS ═══');
    for (const r of settings.rows) {
        emit(`INSERT OR IGNORE INTO settings (id, company_name, phone, email, license_number, insurance_amount, bbb_rating, mission_statement, brand_voice, brand_tone, brand_avoid, theme_preference, warranty_enable_notifications, warranty_notification_email_template, updated_at) VALUES (${v(r.id)}, ${v(r.company_name)}, ${v(r.phone)}, ${v(r.email)}, ${v(r.license_number)}, ${v(r.insurance_amount)}, ${v(r.bbb_rating)}, ${v(r.mission_statement)}, ${v(r.brand_voice)}, ${v(r.brand_tone)}, ${v(r.brand_avoid)}, ${v(r.theme_preference)}, ${v(r.warranty_enable_notifications)}, ${v(r.warranty_notification_email_template)}, ${ts(r.updated_at)});`);
    }
    emit('');
}

// ─── Write output ────────────────────────────────────────────────────
const output = lines.join('\n');
fs.writeFileSync('d1_seed.sql', output);
console.log(`✅ Wrote d1_seed.sql (${lines.length} lines, ${translationId - 1} translations)`);
