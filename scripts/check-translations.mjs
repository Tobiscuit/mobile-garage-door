#!/usr/bin/env node

/**
 * Translation Lint Script
 * 
 * Two checks in one:
 *   Level 1: Cross-locale key sync — ensures en.json, es.json, vi.json have the same keys
 *   Level 2: Code↔JSON sync — ensures every t('key') call in source has a matching JSON entry
 * 
 * Usage:
 *   node scripts/check-translations.mjs
 *   npm run lint:i18n   (if added to package.json)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const MESSAGES_DIR = join(import.meta.dirname, '..', 'messages');
const SRC_DIR = join(import.meta.dirname, '..', 'src');
const LOCALES = ['en', 'es', 'vi'];
const DEFAULT_LOCALE = 'en';

let errors = 0;
let warnings = 0;

function log(type, msg) {
    if (type === 'error') {
        console.error(`  ❌ ${msg}`);
        errors++;
    } else if (type === 'warn') {
        console.warn(`  ⚠️  ${msg}`);
        warnings++;
    } else {
        console.log(`  ✅ ${msg}`);
    }
}

// ─── Load JSON files ────────────────────────────────────────────────────────────

function loadMessages() {
    const messages = {};
    for (const locale of LOCALES) {
        const path = join(MESSAGES_DIR, `${locale}.json`);
        try {
            messages[locale] = JSON.parse(readFileSync(path, 'utf-8'));
        } catch (e) {
            console.error(`Failed to read ${path}: ${e.message}`);
            process.exit(1);
        }
    }
    return messages;
}

// Flatten nested JSON into dot-notation keys: { "ns.key": "value" }
function flattenKeys(obj, prefix = '') {
    const keys = new Set();
    for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
            for (const sub of flattenKeys(v, fullKey)) {
                keys.add(sub);
            }
        } else {
            keys.add(fullKey);
        }
    }
    return keys;
}

// ─── Level 1: Cross-locale key sync ─────────────────────────────────────────────

function checkKeySyncAcrossLocales(messages) {
    console.log('\n🔍 Level 1: Cross-locale key sync');
    console.log('   Checking that all locales have the same translation keys...\n');

    const keysByLocale = {};
    for (const locale of LOCALES) {
        keysByLocale[locale] = flattenKeys(messages[locale]);
    }

    const referenceKeys = keysByLocale[DEFAULT_LOCALE];
    let allGood = true;

    for (const locale of LOCALES) {
        if (locale === DEFAULT_LOCALE) continue;

        const localeKeys = keysByLocale[locale];

        // Keys in en but missing from this locale
        const missingInLocale = [...referenceKeys].filter(k => !localeKeys.has(k));
        // Keys in this locale but not in en (extra/stale)
        const extraInLocale = [...localeKeys].filter(k => !referenceKeys.has(k));

        if (missingInLocale.length > 0) {
            allGood = false;
            log('error', `${locale}.json is missing ${missingInLocale.length} key(s) that exist in ${DEFAULT_LOCALE}.json:`);
            for (const key of missingInLocale.slice(0, 10)) {
                console.error(`         → ${key}`);
            }
            if (missingInLocale.length > 10) {
                console.error(`         ... and ${missingInLocale.length - 10} more`);
            }
        }

        if (extraInLocale.length > 0) {
            log('warn', `${locale}.json has ${extraInLocale.length} extra key(s) not in ${DEFAULT_LOCALE}.json:`);
            for (const key of extraInLocale.slice(0, 5)) {
                console.warn(`         → ${key}`);
            }
        }
    }

    if (allGood) {
        log('ok', `All locales have matching keys (${referenceKeys.size} keys each)`);
    }
}

// ─── Level 2: Code↔JSON sync ────────────────────────────────────────────────────

function findTsxFiles(dir) {
    const results = [];
    try {
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry);
            try {
                const stat = statSync(full);
                if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
                    results.push(...findTsxFiles(full));
                } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
                    results.push(full);
                }
            } catch { }
        }
    } catch { }
    return results;
}

function checkCodeReferencesExistInJson(messages) {
    console.log('\n🔍 Level 2: Code → JSON sync');
    console.log('   Checking that every t("key") in source has a matching JSON entry...\n');

    const enMessages = messages[DEFAULT_LOCALE];
    const files = findTsxFiles(SRC_DIR);

    // Exclude translation infrastructure files — they contain t('example') in
    // JSDoc/comments that aren't actual translation references
    const EXCLUDE_PATTERNS = [
        'hooks/useTranslations',
        'lib/server-translations',
    ];

    // Match: useTranslations('namespace') or getTranslations({ ..., namespace: 'namespace' })
    const nsRegex = /useTranslations\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    const serverNsRegex = /namespace:\s*['"]([^'"]+)['"]/g;
    // Match: t('key') or t("key")
    const tCallRegex = /\bt\s*\(\s*['"]([^'"]+)['"]/g;

    let totalChecked = 0;
    let allGood = true;

    for (const file of files) {
        const content = readFileSync(file, 'utf-8');
        const relPath = relative(join(import.meta.dirname, '..'), file);

        // Skip translation infrastructure files
        if (EXCLUDE_PATTERNS.some(p => relPath.includes(p))) continue;

        // Find namespace declarations
        const namespaces = new Set();
        let match;
        while ((match = nsRegex.exec(content)) !== null) {
            namespaces.add(match[1]);
        }
        while ((match = serverNsRegex.exec(content)) !== null) {
            namespaces.add(match[1]);
        }

        if (namespaces.size === 0) continue;

        // Find t('key') calls
        const keys = new Set();
        while ((match = tCallRegex.exec(content)) !== null) {
            keys.add(match[1]);
        }

        if (keys.size === 0) continue;

        for (const ns of namespaces) {
            const nsData = enMessages[ns];
            if (!nsData) {
                allGood = false;
                log('error', `${relPath}: namespace "${ns}" not found in ${DEFAULT_LOCALE}.json`);
                continue;
            }

            for (const key of keys) {
                // Skip keys that look like they're from a different namespace (contain dots)
                if (key.includes('.')) continue;

                totalChecked++;
                if (!(key in nsData)) {
                    allGood = false;
                    log('error', `${relPath}: t('${key}') not found in ${DEFAULT_LOCALE}.json → ${ns}.${key}`);
                }
            }
        }
    }

    if (allGood) {
        log('ok', `All ${totalChecked} translation key references in code match JSON entries`);
    }
}

// ─── Run ─────────────────────────────────────────────────────────────────────────

console.log('╔══════════════════════════════════════════════╗');
console.log('║       Translation Lint Check (i18n)         ║');
console.log('╚══════════════════════════════════════════════╝');

const messages = loadMessages();
checkKeySyncAcrossLocales(messages);
checkCodeReferencesExistInJson(messages);

console.log('\n' + '─'.repeat(48));
if (errors > 0) {
    console.error(`\n💥 ${errors} error(s), ${warnings} warning(s). Fix missing translations!\n`);
    process.exit(1);
} else if (warnings > 0) {
    console.log(`\n⚠️  No errors, but ${warnings} warning(s). Consider cleaning up.\n`);
} else {
    console.log(`\n🎉 All translation checks passed!\n`);
}
