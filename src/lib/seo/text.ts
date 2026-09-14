/**
 * Plain-text helpers for descriptions built from database content (Google:
 * "Programmatically generate descriptions" from the page's own content).
 */

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

/** Text of an HTML fragment or a Lexical JSON document, whitespace collapsed. */
export function plainText(content: string | null | undefined): string {
  if (!content) return '';
  const trimmed = content.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parts: string[] = [];
      const walk = (node: any) => {
        if (!node || typeof node !== 'object') return;
        if (typeof node.text === 'string') parts.push(node.text);
        if (Array.isArray(node.children)) node.children.forEach(walk);
        if (node.root) walk(node.root);
      };
      walk(JSON.parse(trimmed));
      return parts.join(' ').replace(/\s+/g, ' ').trim();
    } catch {
      // Not JSON after all; treat as HTML/text below.
    }
  }
  return trimmed
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#39|[a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match)
    .replace(/\s+/g, ' ')
    .trim();
}

/** At most `max` characters, cut at a word boundary, with an ellipsis when shortened. */
export function excerpt(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–—-]+$/, '')}…`;
}
