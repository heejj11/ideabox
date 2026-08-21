import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { App } from './App';
import { AppProviders } from './AppProviders';
import { queryClient } from './queryClient';

afterEach(() => {
  cleanup();
  queryClient.clear();
  useAuthStore.getState().clear('unconfigured');
  useUiStore.getState().selectIdea(null);
  window.history.replaceState(null, '', '/');
  localStorage.clear();
});

describe('Idea Box app shell', () => {
  it('shows a useful signed-out preview and opens a read-only detail panel', async () => {
    const user = userEvent.setup();
    render(
      <AppProviders>
        <App />
      </AppProviders>
    );

    expect(screen.getByText('Google 연결 설정이 필요해요')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '퇴근길 생각 수집기' }));
    expect(screen.getByRole('dialog', { name: '아이디어 다듬기' })).toBeInTheDocument();
    expect(screen.getByText('지금은 읽기 전용입니다. 온라인으로 다시 연결한 뒤 수정해 주세요.')).toBeInTheDocument();
  });

  it('debounces integrated search and keeps it in the URL', async () => {
    const user = userEvent.setup();
    render(
      <AppProviders>
        <App />
      </AppProviders>
    );

    await user.type(screen.getByRole('searchbox', { name: '아이디어 찾기' }), '식물');
    await waitFor(() => expect(screen.queryByRole('button', { name: '퇴근길 생각 수집기' })).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: '동네 식물 지도' })).toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get('q')).toBe('식물');
  });
});
