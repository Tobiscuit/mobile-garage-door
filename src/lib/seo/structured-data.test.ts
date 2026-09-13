import { describe, expect, it } from 'vitest';
import {
  BUSINESS_ID,
  FORBIDDEN_PROPERTIES,
  blogPostingNode,
  businessNode,
  graph,
  serializeJsonLd,
  serviceNodes,
  websiteNode,
} from './structured-data';
import { SITE_ORIGIN } from './site';

/** Every key anywhere in a JSON-LD tree. */
function allKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((item) => allKeys(item, keys));
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      keys.add(key);
      allKeys(child, keys);
    }
  }
  return keys;
}

describe('businessNode', () => {
  const node = businessNode('We fix garage doors.');

  it('uses the most specific applicable schema.org type', () => {
    expect(node['@type']).toBe('HomeAndConstructionBusiness');
    expect(node['@id']).toBe(BUSINESS_ID);
  });

  it('carries only facts the site shows', () => {
    expect(node).toMatchObject({
      name: 'Mobil Garage Door',
      url: SITE_ORIGIN,
      telephone: '+1-832-419-1293',
      foundingDate: '2000',
      description: 'We fix garage doors.',
    });
    expect(node.logo).toBe(`${SITE_ORIGIN}/images/logos/logo.jpg`);
  });
});

describe('websiteNode', () => {
  it('has the site-name properties Google requires (name, url)', () => {
    const node = websiteNode();
    expect(node).toMatchObject({ '@type': 'WebSite', name: 'Mobil Garage Door', url: SITE_ORIGIN });
  });
});

describe('serviceNodes', () => {
  it('describes each rendered service and skips records without a title', () => {
    const nodes = serviceNodes(
      [
        { title: 'Spring repair', description: 'Broken springs replaced.' },
        { title: '', description: 'ignored' },
        { title: 'New doors', description: null },
      ],
      `${SITE_ORIGIN}/services`,
    );
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toMatchObject({ '@type': 'Service', name: 'Spring repair', url: `${SITE_ORIGIN}/services` });
    expect(nodes[0].provider).toMatchObject({ '@id': BUSINESS_ID, name: 'Mobil Garage Door' });
    expect(nodes[1]).not.toHaveProperty('description');
  });
});

describe('blogPostingNode', () => {
  it('makes the image absolute and attributes the post to the business', () => {
    const node = blogPostingNode({
      headline: 'A post',
      description: 'Summary',
      imageUrl: '/api/media/blog/cover.webp',
      datePublished: '2026-01-01T00:00:00.000Z',
      url: `${SITE_ORIGIN}/blog/a-post`,
      locale: 'en',
    });
    expect(node).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'A post',
      image: `${SITE_ORIGIN}/api/media/blog/cover.webp`,
      datePublished: '2026-01-01T00:00:00.000Z',
      mainEntityOfPage: `${SITE_ORIGIN}/blog/a-post`,
    });
    expect(node.author).toMatchObject({ '@type': 'Organization', name: 'Mobil Garage Door' });
  });
});

describe('invented facts', () => {
  it('never appear in any node: no ratings, reviews, prices, hours, address or geo', () => {
    const everything = graph([
      businessNode('x'),
      websiteNode(),
      ...serviceNodes([{ title: 'A', description: 'B' }], SITE_ORIGIN),
      blogPostingNode({ headline: 'h', url: SITE_ORIGIN, locale: 'en', imageUrl: '/i.webp', datePublished: '2026-01-01' }),
    ]);
    const keys = allKeys(everything);
    for (const forbidden of FORBIDDEN_PROPERTIES) expect(keys.has(forbidden)).toBe(false);
  });
});

describe('serializeJsonLd', () => {
  it('escapes "<" so record text cannot close the script tag, and still parses', () => {
    const data = graph([serviceNodes([{ title: '</script><script>alert(1)</script>', description: null }], SITE_ORIGIN)[0]]);
    const json = serializeJsonLd(data);
    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual(data);
  });
});
