import type { AuthStatus } from '../../stores/authStore';

interface SiteHeaderProps {
  authStatus: AuthStatus;
  isOnline: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function SiteHeader({ authStatus, isOnline, onSignIn, onSignOut }: SiteHeaderProps) {
  const authenticated = authStatus === 'signed-in' || authStatus === 'renewing';

  return (
    <header className="site-header">
      <div className="brand-lockup">
        <h1>Idea Box</h1>
        <p>완성되지 않은 생각도, 일단 여기 붙여두세요.</p>
      </div>
      <div className="session-tools">
        <span className={`connection-state ${isOnline ? '' : 'connection-state--offline'}`}>
          <span aria-hidden="true" />
          {isOnline ? '온라인' : '오프라인'}
        </span>
        <button type="button" className="text-button" onClick={authenticated ? onSignOut : onSignIn}>
          {authenticated ? '로그아웃' : '로그인'}
        </button>
      </div>
    </header>
  );
}
