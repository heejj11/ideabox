import type { AuthStatus } from '../../stores/authStore';

interface AuthNoticeProps {
  status: AuthStatus;
  error: string | null;
  onSignIn: () => void;
}

export function AuthNotice({ status, error, onSignIn }: AuthNoticeProps) {
  if (status === 'signed-in' || status === 'renewing') {
    return null;
  }

  const unconfigured = status === 'unconfigured';
  const busy = status === 'signing-in';

  return (
    <section className="auth-notice" aria-live="polite">
      <div>
        <strong>{unconfigured ? 'Google 연결 설정이 필요해요' : '내 아이디어 상자를 열어주세요'}</strong>
        <p>
          {unconfigured
            ? '.env.local에 VITE_GOOGLE_CLIENT_ID를 추가한 뒤 개발 서버를 다시 시작하세요.'
            : error || '로그인하면 이 앱이 만든 IdeaBox 폴더와 ideas 시트에만 접근합니다.'}
        </p>
      </div>
      <button type="button" className="button button--accent" onClick={onSignIn} disabled={unconfigured || busy}>
        {busy ? '연결 중…' : 'Google로 시작하기'}
      </button>
    </section>
  );
}
