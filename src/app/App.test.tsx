import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach } from 'vitest';
import { demoIdeas } from '../features/ideas/demoIdeas';
import { ideaKeys } from '../features/ideas/queries';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { App } from './App';
import { AppProviders } from './AppProviders';
import { queryClient } from './queryClient';

beforeEach(() => {
  useAuthStore.getState().clear('unconfigured');
});

afterEach(() => {
  cleanup();
  queryClient.clear();
  useAuthStore.getState().clear('unconfigured');
  useUiStore.getState().selectIdea(null);
  window.history.replaceState(null, '', '/');
  localStorage.clear();
});

describe('Idea Box app shell', () => {
  it('shows an empty board while signed out instead of sample ideas', () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>
    );

    expect(screen.getByText('Google 연결 설정이 필요해요')).toBeInTheDocument();
    expect(screen.getByText('아직 붙여둔 생각이 없어요.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '퇴근길 생각 수집기' })).not.toBeInTheDocument();
  });

  it('debounces integrated search and keeps it in the URL', async () => {
    const user = userEvent.setup();
    useAuthStore.getState().setToken('test-token', 3_600);
    queryClient.setQueryData(ideaKeys.all, { ideas: demoIdeas, source: 'network' });
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
