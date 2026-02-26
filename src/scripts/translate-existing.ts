/**
 * One-time script: Translate existing English content to Spanish
 * 
 * Usage: npx tsx src/scripts/translate-existing.ts
 * 
 * This script:
 * 1. Fetches all Posts, Services, Projects, Testimonials in 'en' locale
 * 2. Translates plain text, HTML fields, and Lexical JSON trees via Gemini
 * 3. Saves the translations to the target locales ('es', 'vi') via Payload's Local API
 * 
 * Pass --force to re-translate items that already have translations.
 */
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import 'dotenv/config';
import { getPayload } from 'payload';
import config from '@payload-config';
import { translate, translateLexicalTree, translateArray } from '../lib/translate-utils';

const FORCE = process.argv.includes('--force');

// --- Main ---
async function main() {
  const targetLocales = ['es', 'vi'];
  console.log('\n🌎 Starting multilingual content migration...');
  if (FORCE) console.log('⚡ FORCE mode: Re-translating ALL items\n');
  else console.log('📝 Incremental mode: Skipping already-translated items\n');
  
  const payload = await getPayload({ config });

  // --- 1. Testimonials ---
  console.log('📝 Translating Testimonials...');
  const testimonials = await payload.find({ collection: 'testimonials', locale: 'en', limit: 100 });
  for (const t of testimonials.docs) {
    for (const locale of targetLocales) {
      if (!FORCE) {
        const existing = await payload.findByID({ collection: 'testimonials', id: t.id, locale: locale as any });
        if (existing.quote && existing.quote !== t.quote) {
          console.log(`  ⏭ Skipping "${t.author}" (${locale}) (already translated)`);
          continue;
        }
      }
      
      const tlQuote = await translate(t.quote as string, 'customer testimonial / review', locale);
      const tlLocation = await translate(t.location as string, 'location name', locale);
      
      await payload.update({
        collection: 'testimonials',
        id: t.id,
        locale: locale as any,
        data: { quote: tlQuote, location: tlLocation },
      });
      console.log(`  ✅ ${t.author} (${locale})`);
    }
  }

  // --- 2. Services ---
  console.log('\n🔧 Translating Services...');
  const services = await payload.find({ collection: 'services', locale: 'en', limit: 100 });
  for (const s of services.docs) {
    for (const locale of targetLocales) {
      if (!FORCE) {
        const existing = await payload.findByID({ collection: 'services', id: s.id, locale: locale as any });
        if (existing.title && existing.title !== s.title) {
          console.log(`  ⏭ Skipping "${s.title}" (${locale}) (already translated)`);
          continue;
        }
      }
      
      const tlTitle = await translate(s.title as string, 'service name', locale);
      const tlCategory = await translate(s.category as string, 'service category', locale);
      const tlDescription = await translate(s.description as string, 'service description', locale);
      const tlFeatures = await translateArray(
        s.features as Array<{ feature: string; id?: string }>,
        { feature: 'service feature bullet point' },
        locale
      );
      
      await payload.update({
        collection: 'services',
        id: s.id,
        locale: locale as any,
        data: { title: tlTitle, category: tlCategory, description: tlDescription, features: tlFeatures },
      });
      console.log(`  ✅ ${s.title} (${locale})`);
    }
  }

  // --- 3. Projects (with Lexical tree translation) ---
  console.log('\n🏗️ Translating Projects...');
  const projects = await payload.find({ collection: 'projects', locale: 'en', limit: 100 });
  for (const p of projects.docs) {
    for (const locale of targetLocales) {
      if (!FORCE) {
        const existing = await payload.findByID({ collection: 'projects', id: p.id, locale: locale as any });
        if (existing.title && existing.title !== p.title) {
          console.log(`  ⏭ Skipping "${p.title}" (${locale}) (already translated)`);
          continue;
        }
      }

      console.log(`  🔄 ${p.title} (${locale})...`);

      const tlTitle = await translate(p.title as string, 'project title', locale);
      const tlClient = await translate(p.client as string, 'client type description', locale);
      
      // Translate Lexical richText fields (deep tree walk)
      const tlDescription = p.description ? await translateLexicalTree(p.description, locale) : p.description;
      const tlChallenge = p.challenge ? await translateLexicalTree(p.challenge, locale) : p.challenge;
      const tlSolution = p.solution ? await translateLexicalTree(p.solution, locale) : p.solution;

      // Translate HTML content fields
      const tlHtmlDesc = p.htmlDescription ? await translate(p.htmlDescription as string, 'project case study HTML content', locale) : undefined;
      const tlHtmlChallenge = p.htmlChallenge ? await translate(p.htmlChallenge as string, 'project challenge HTML content', locale) : undefined;
      const tlHtmlSolution = p.htmlSolution ? await translate(p.htmlSolution as string, 'project solution HTML content', locale) : undefined;
      
      // Translate stats array
      const tlStats = await translateArray(
        p.stats as Array<{ label: string; value: string; id?: string }>,
        { label: 'metric label', value: 'metric value' },
        locale
      );
      
      const updateData: Record<string, unknown> = {
        title: tlTitle,
        client: tlClient,
        description: tlDescription,
        challenge: tlChallenge,
        solution: tlSolution,
        stats: tlStats,
      };
      if (tlHtmlDesc) updateData.htmlDescription = tlHtmlDesc;
      if (tlHtmlChallenge) updateData.htmlChallenge = tlHtmlChallenge;
      if (tlHtmlSolution) updateData.htmlSolution = tlHtmlSolution;
      
      await payload.update({
        collection: 'projects',
        id: p.id,
        locale: locale as any,
        data: updateData,
      });
      console.log(`  ✅ ${p.title} (${locale})`);
    }
  }

  // --- 4. Posts (with Lexical tree translation) ---
  console.log('\n📰 Translating Blog Posts...');
  const posts = await payload.find({ collection: 'posts', locale: 'en', limit: 100 });
  for (const post of posts.docs) {
    for (const locale of targetLocales) {
      if (!FORCE) {
        const existing = await payload.findByID({ collection: 'posts', id: post.id, locale: locale as any });
        if (existing.title && existing.title !== post.title) {
          console.log(`  ⏭ Skipping "${post.title}" (${locale}) (already translated)`);
          continue;
        }
      }

      console.log(`  🔄 ${post.title} (${locale})...`);

      const tlTitle = await translate(post.title as string, 'blog post title', locale);
      const tlExcerpt = post.excerpt ? await translate(post.excerpt as string, 'blog post excerpt / summary', locale) : undefined;
      const tlHtmlContent = post.htmlContent ? await translate(post.htmlContent as string, 'blog article HTML content', locale) : undefined;
      
      // Translate Lexical content field
      const tlContent = post.content ? await translateLexicalTree(post.content, locale) : undefined;
      
      const updateData: Record<string, unknown> = { title: tlTitle };
      if (tlExcerpt) updateData.excerpt = tlExcerpt;
      if (tlHtmlContent) updateData.htmlContent = tlHtmlContent;
      if (tlContent) updateData.content = tlContent;
      
      await payload.update({
        collection: 'posts',
        id: post.id,
        locale: locale as any,
        data: updateData,
      });
      console.log(`  ✅ ${post.title} (${locale})`);
    }
  }

  console.log('\n🎉 Translation complete!\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Translation script failed:', err);
  process.exit(1);
});
