import { describe, expect, it } from 'vitest';
import { extractLocalSites, parseLocalSite } from './localSites';

describe('local site links', () => {
  it('extracts unique loopback URLs and builds a port-specific stop command', () => {
    expect(
      extractLocalSites(`
        [열기](http://localhost:5301/)
        http://localhost:5301/
        [미리보기](http://127.0.0.1:5305/preview/?mode=all)
        https://example.com
      `)
    ).toEqual([
      {
        url: 'http://localhost:5301/',
        origin: 'http://localhost:5301',
        port: 5301,
        pathLabel: '홈',
        stopCommand: 'lsof -tiTCP:5301 -sTCP:LISTEN | xargs kill',
      },
      {
        url: 'http://127.0.0.1:5305/preview/?mode=all',
        origin: 'http://127.0.0.1:5305',
        port: 5305,
        pathLabel: '/preview/?mode=all',
        stopCommand: 'lsof -tiTCP:5305 -sTCP:LISTEN | xargs kill',
      },
    ]);
  });

  it('rejects non-loopback and invalid URLs', () => {
    expect(parseLocalSite('https://example.com:5301')).toBeNull();
    expect(parseLocalSite('not-a-url')).toBeNull();
  });
});
