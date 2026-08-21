import type { AuthStatus } from '../../stores/authStore';

interface SiteHeaderProps {
  authenticated: boolean;
  authStatus: AuthStatus;
  isOnline: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function SiteHeader({ authenticated, authStatus, isOnline, onSignIn, onSignOut }: SiteHeaderProps) {
  const connecting = !authenticated && (authStatus === 'signing-in' || authStatus === 'renewing');

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
        <button
          type="button"
          className="text-button"
          onClick={authenticated ? onSignOut : onSignIn}
          disabled={connecting}
        >
          {authenticated ? '로그아웃' : connecting ? '연결 중…' : '로그인'}
        </button>
      </div>
    </header>
  );
}
