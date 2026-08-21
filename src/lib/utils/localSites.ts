export interface LocalSite {
  url: string;
  origin: string;
  port: number;
  pathLabel: string;
  stopCommand: string;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);
const LOCAL_URL_PATTERN = /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d{1,5})?(?:\/[^\s\])}>"']*)?/gi;

export function parseLocalSite(value: string): LocalSite | null {
  try {
    const parsed = new URL(value);
    if (!LOCAL_HOSTS.has(parsed.hostname)) return null;

    const port = Number.parseInt(parsed.port || (parsed.protocol === 'https:' ? '443' : '80'), 10);
    if (!Number.isInteger(port) || port < 1 || port > 65_535) return null;

    const pathLabel = `${parsed.pathname}${parsed.search}` === '/' ? '홈' : `${parsed.pathname}${parsed.search}`;

    return {
      url: parsed.toString(),
      origin: parsed.origin,
      port,
      pathLabel,
      stopCommand: `lsof -tiTCP:${port} -sTCP:LISTEN | xargs kill`,
    };
  } catch {
    return null;
  }
}

export function extractLocalSites(markdown: string): LocalSite[] {
  const matches = markdown.match(LOCAL_URL_PATTERN) ?? [];
  const sites = matches.map(parseLocalSite).filter((site): site is LocalSite => site !== null);
  return [...new Map(sites.map((site) => [site.url, site])).values()];
}
