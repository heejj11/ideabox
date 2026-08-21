const MARKDOWN_PREFIX = /^(?:#{1,6}\s+|>\s*|[-*+]\s+|\d+[.)]\s+)/;
const MARKDOWN_DECORATION = /[*_~`]/g;
const MARKDOWN_IMAGE = /!\[[^\]]*\]\([^)]*\)/g;
const MARKDOWN_LINK = /\[([^\]]+)\]\([^)]*\)/g;

export function cleanMarkdownLine(line: string): string {
  return line
    .trim()
    .replace(MARKDOWN_PREFIX, '')
    .replace(MARKDOWN_IMAGE, '')
    .replace(MARKDOWN_LINK, '$1')
    .replace(MARKDOWN_DECORATION, '')
    .trim();
}

export function extractIdeaTitle(body: string, fallback = '제목 없는 아이디어'): string {
  const firstLine = body
    .split(/\r?\n/)
    .map(cleanMarkdownLine)
    .find((line) => line.length > 0);

  if (!firstLine) {
    return fallback;
  }

  return firstLine.length > 80 ? `${firstLine.slice(0, 77).trimEnd()}…` : firstLine;
}

export function resolveIdeaTitle(title: string, body: string): string {
  return title.trim() || extractIdeaTitle(body);
}
