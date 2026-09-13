import { describe, expect, it } from 'vitest';
import { excerpt, plainText } from './text';
import { formatDate, isoDate } from './dates';

describe('plainText', () => {
  it('strips HTML and decodes common entities', () => {
    expect(plainText('<p>Springs &amp; openers</p>\n<script>x()</script><p>fixed&nbsp;fast</p>')).toBe('Springs & openers fixed fast');
  });

  it('reads the text of a Lexical JSON document', () => {
    const lexical = JSON.stringify({ root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Hello' }, { type: 'text', text: 'world' }] }] } });
    expect(plainText(lexical)).toBe('Hello world');
  });

  it('returns an empty string for empty input', () => {
    expect(plainText(null)).toBe('');
  });
});

describe('excerpt', () => {
  it('leaves short text alone', () => {
    expect(excerpt('Short text.', 160)).toBe('Short text.');
  });

  it('cuts at a word boundary and adds an ellipsis', () => {
    const text = 'word '.repeat(60).trim();
    const result = excerpt(text, 40);
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result.endsWith('…')).toBe(true);
    expect(result).not.toMatch(/wor…$/);
  });
});

describe('dates', () => {
  it('formats a date-only value on the same day in every locale', () => {
    expect(formatDate('2026-01-01', 'en')).toBe('January 1, 2026');
    expect(formatDate('2026-01-01', 'es')).toMatch(/1 de enero de 2026/);
    expect(formatDate('not a date', 'en')).toBe('');
    expect(isoDate('2026-01-01')).toBe('2026-01-01T00:00:00.000Z');
  });
});
