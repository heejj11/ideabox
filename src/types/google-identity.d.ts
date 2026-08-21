interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

interface GoogleTokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (error: { type: string; message?: string }) => void;
}

interface GoogleTokenClient {
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (error: { type: string; message?: string }) => void;
  requestAccessToken: (overrideConfig?: { prompt?: '' | 'none' | 'consent' | 'select_account' }) => void;
}

interface GoogleOAuth2Api {
  initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
  revoke: (accessToken: string, callback?: () => void) => void;
}

interface GoogleAccountsApi {
  oauth2: GoogleOAuth2Api;
}

interface GoogleIdentityApi {
  accounts: GoogleAccountsApi;
}

interface Window {
  google?: GoogleIdentityApi;
}
