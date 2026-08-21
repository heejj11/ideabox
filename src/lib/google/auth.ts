import { useAuthStore } from '../../stores/authStore';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
].join(' ');

const GIS_SCRIPT_ID = 'google-identity-services';
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
export const TOKEN_EXPIRY_BUFFER_MS = 5 * 60_000;

type TokenPrompt = '';

let tokenClient: GoogleTokenClient | null = null;
let clientId: string | null = null;
let scriptPromise: Promise<void> | null = null;
let renewalPromise: Promise<string> | null = null;

export class GoogleAuthError extends Error {
  constructor(message: string, public readonly code = 'auth_failed') {
    super(message);
    this.name = 'GoogleAuthError';
  }
}

function popupErrorMessage(type: string, fallback?: string): string {
  if (type === 'popup_failed_to_open') {
    return 'Google 연결 창을 열지 못했습니다. 팝업 차단을 허용한 뒤 다시 시도해 주세요.';
  }
  if (type === 'popup_closed') {
    return 'Google 연결 창이 닫혔습니다. 다시 연결해 주세요.';
  }
  return fallback || 'Google 로그인 창을 열지 못했습니다.';
}

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts.oauth2) {
    return Promise.resolve();
  }

  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GIS_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');

    const handleLoad = () => resolve();
    const handleError = () => {
      scriptPromise = null;
      script.remove();
      reject(new GoogleAuthError('Google 로그인 도구를 불러오지 못했습니다.', 'script_load_failed'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existing) {
      script.id = GIS_SCRIPT_ID;
      script.src = GIS_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
  });

  return scriptPromise;
}

async function getTokenClient(): Promise<GoogleTokenClient> {
  if (!clientId) {
    throw new GoogleAuthError('VITE_GOOGLE_CLIENT_ID가 설정되지 않았습니다.', 'missing_client_id');
  }

  await loadGoogleIdentityScript();

  if (!window.google?.accounts.oauth2) {
    throw new GoogleAuthError('Google 로그인 도구를 사용할 수 없습니다.', 'gis_unavailable');
  }

  tokenClient ??= window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: GOOGLE_SCOPES,
    callback: () => undefined,
  });

  return tokenClient;
}

function requestToken(prompt: TokenPrompt): Promise<string> {
  return getTokenClient().then(
    (client) =>
      new Promise<string>((resolve, reject) => {
        client.callback = (response) => {
          if (response.error || !response.access_token) {
            reject(
              new GoogleAuthError(
                response.error_description || 'Google 인증을 완료하지 못했습니다.',
                response.error || 'token_error'
              )
            );
            return;
          }

          useAuthStore.getState().setToken(response.access_token, Number(response.expires_in));
          resolve(response.access_token);
        };
        client.error_callback = (error) => {
          reject(new GoogleAuthError(popupErrorMessage(error.type, error.message), error.type));
        };
        client.requestAccessToken({ prompt });
      })
  );
}

export function configureGoogleAuth(nextClientId: string | undefined): void {
  clientId = nextClientId?.trim() || null;
  tokenClient = null;
  renewalPromise = null;
  useAuthStore.getState().clear(clientId ? 'signed-out' : 'unconfigured');
}

export async function signIn(): Promise<string> {
  if (renewalPromise) {
    return renewalPromise;
  }

  useAuthStore.getState().setStatus('signing-in');

  try {
    return await requestToken('');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google 로그인을 완료하지 못했습니다.';
    useAuthStore.getState().setError(message);
    throw error;
  }
}

export async function getValidAccessToken(forceRenew = false): Promise<string> {
  const auth = useAuthStore.getState();
  if (!forceRenew && auth.accessToken && auth.expiresAt - Date.now() > TOKEN_EXPIRY_BUFFER_MS) {
    return auth.accessToken;
  }

  renewalPromise ??= (async () => {
    useAuthStore.getState().setStatus('renewing');

    try {
      return await requestToken('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google 로그인이 만료되었습니다.';
      useAuthStore.getState().setError(`${message} 다시 로그인해 주세요.`);
      throw error;
    } finally {
      renewalPromise = null;
    }
  })();

  return renewalPromise;
}

export function invalidateAccessToken(): void {
  const state = useAuthStore.getState();
  state.clear('signed-out');
}

export function signOut(): void {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken && window.google?.accounts.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken);
  }
  useAuthStore.getState().clear('signed-out');
}
