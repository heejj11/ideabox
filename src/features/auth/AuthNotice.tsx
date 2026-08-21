import type { AuthStatus } from '../../stores/authStore';

interface AuthNoticeProps {
  status: AuthStatus;
  error: string | null;
  resumeAvailable: boolean;
  onSignIn: () => void;
}

export function AuthNotice({ status, error, resumeAvailable, onSignIn }: AuthNoticeProps) {
  if (status === 'signed-in' || status === 'renewing') {
    return null;
  }

  const unconfigured = status === 'unconfigured';
  const busy = status === 'signing-in';

  return (
    <section className="auth-notice" aria-live="polite">
      <div>
        <strong>
          {unconfigured ? 'Google 연결 설정이 필요해요' : '내 아이디어 상자를 열어주세요'}
        </strong>
        <p>
          {unconfigured
            ? '.env.local에 VITE_GOOGLE_CLIENT_ID를 추가한 뒤 개발 서버를 다시 시작하세요.'
            : error ||
              (resumeAvailable
                ? '한 번 누르면 이전에 사용한 Google 계정으로 바로 이어집니다.'
                : '로그인하면 이 앱이 만든 IdeaBox 폴더와 ideas 시트에만 접근합니다.')}
        </p>
      </div>
      <button type="button" className="button button--accent" onClick={onSignIn} disabled={unconfigured || busy}>
        {busy ? '연결 중…' : resumeAvailable ? 'Idea Box 이어서 열기' : 'Google로 시작하기'}
      </button>
    </section>
  );
}
