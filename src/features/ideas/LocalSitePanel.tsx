import { useCallback, useEffect, useMemo, useState } from 'react';
import { extractLocalSites, type LocalSite } from '../../lib/utils/localSites';

interface LocalSitePanelProps {
  markdown: string;
}

type SiteState = 'checking' | 'running' | 'stopped';
type CopyState = 'idle' | 'copied' | 'failed';

interface LocalSiteRowProps {
  site: LocalSite;
}

function LocalSiteRow({ site }: LocalSiteRowProps) {
  const [siteState, setSiteState] = useState<SiteState>('checking');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const checkSite = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 2200);
    setSiteState('checking');

    try {
      await fetch(site.origin, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
      setSiteState('running');
    } catch {
      setSiteState('stopped');
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, [site.origin]);

  useEffect(() => {
    void checkSite();
  }, [checkSite]);

  const copyStopCommand = async () => {
    try {
      await navigator.clipboard.writeText(site.stopCommand);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
    }
  };

  const stateLabel = siteState === 'checking' ? '확인 중' : siteState === 'running' ? '실행 중' : '꺼짐';

  return (
    <li className="local-site-row">
      <div className="local-site-row__address">
        <span
          className={`local-site-state local-site-state--${siteState}`}
          aria-label={`사이트 상태: ${stateLabel}`}
        />
        <div>
          <strong>PORT {site.port}</strong>
          <span title={site.url}>{site.pathLabel}</span>
        </div>
      </div>
      <div className="local-site-row__actions">
        <button type="button" className="text-button" onClick={() => void checkSite()}>
          {stateLabel}
        </button>
        <a
          className="button button--small button--accent"
          href={site.url}
          target="_blank"
          rel="noreferrer"
        >
          사이트 열기
        </a>
        <button type="button" className="button button--small" onClick={() => void copyStopCommand()}>
          {copyState === 'copied'
            ? '중지 명령 복사됨'
            : copyState === 'failed'
              ? '복사 실패'
              : '중지 명령 복사'}
        </button>
      </div>
    </li>
  );
}

export function LocalSitePanel({ markdown }: LocalSitePanelProps) {
  const sites = useMemo(() => extractLocalSites(markdown), [markdown]);
  if (!sites.length) return null;

  return (
    <section className="local-site-panel" aria-labelledby="local-site-panel-title">
      <div className="local-site-panel__heading">
        <div>
          <h3 id="local-site-panel-title">로컬 사이트</h3>
          <p>포트 상태를 확인하고 바로 열 수 있어요.</p>
        </div>
        <span>{sites.length}곳</span>
      </div>
      <ul className="local-site-list">
        {sites.map((site) => (
          <LocalSiteRow key={site.url} site={site} />
        ))}
      </ul>
      <p className="local-site-panel__note">
        브라우저 보안상 여기서 직접 종료하지 않고, 터미널에 붙여넣을 중지 명령을
        복사합니다.
      </p>
    </section>
  );
}
