import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../../stores/authStore';
import { configureGoogleAuth, getValidAccessToken, prepareGoogleAuth, signIn, signOut } from './auth';

function successfulTokenResponse(): GoogleTokenResponse {
  return {
    access_token: 'test-access-token',
    expires_in: 3_600,
    scope: 'test-scope',
    token_type: 'Bearer',
  };
}

function installGoogleMock(response: GoogleTokenResponse = successfulTokenResponse()) {
  let tokenClient: GoogleTokenClient;
  const requestAccessToken = vi.fn((overrideConfig?: {
    prompt?: '' | 'none' | 'consent' | 'select_account';
    login_hint?: string;
  }) => {
    queueMicrotask(() => {
      tokenClient.callback(response);
    });
    return overrideConfig;
  });
  const revoke = vi.fn();
  const initTokenClient = vi.fn((config: GoogleTokenClientConfig) => {
    tokenClient = {
      callback: config.callback,
      error_callback: config.error_callback,
      requestAccessToken,
    };
    return tokenClient;
  });

  window.google = {
    accounts: {
      oauth2: {
        initTokenClient,
        revoke,
      },
    },
  };

  return { initTokenClient, requestAccessToken, revoke };
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.getState().clear('signed-out');
});

afterEach(() => {
  configureGoogleAuth(undefined);
  window.google = undefined;
  vi.restoreAllMocks();
});

describe('Google authentication token handling', () => {
  it('keeps the token in memory and avoids repeated consent prompts', async () => {
    const google = installGoogleMock();
    configureGoogleAuth('client-id');

    await expect(signIn()).resolves.toBe('test-access-token');

    expect(google.requestAccessToken).toHaveBeenCalledWith({ prompt: '' });
    expect(useAuthStore.getState().accessToken).toBe('test-access-token');
    expect(Object.values(localStorage)).not.toContain('test-access-token');
  });

  it('prepares Google auth after a page reload without opening the token flow', async () => {
    const google = installGoogleMock();
    configureGoogleAuth('client-id', 'heejj1111@gmail.com');

    await expect(prepareGoogleAuth()).resolves.toBeUndefined();

    expect(google.initTokenClient).toHaveBeenCalledOnce();
    expect(google.requestAccessToken).not.toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe('signed-out');
  });

  it('uses the configured account hint when the user resumes the session', async () => {
    const google = installGoogleMock();
    configureGoogleAuth('client-id', 'heejj1111@gmail.com');

    await expect(signIn()).resolves.toBe('test-access-token');

    expect(google.requestAccessToken).toHaveBeenCalledWith({
      prompt: '',
      login_hint: 'heejj1111@gmail.com',
    });
    expect(useAuthStore.getState().status).toBe('signed-in');
  });

  it('renews an expiring token without asking for consent again', async () => {
    const google = installGoogleMock();
    configureGoogleAuth('client-id');
    useAuthStore.getState().setToken('expiring-token', 1);

    await expect(getValidAccessToken()).resolves.toBe('test-access-token');

    expect(google.requestAccessToken).toHaveBeenCalledWith({ prompt: 'none' });
  });

  it('revokes the current token when signing out', async () => {
    const google = installGoogleMock();
    configureGoogleAuth('client-id');
    await signIn();
    signOut();

    expect(google.revoke).toHaveBeenCalledWith('test-access-token');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
