import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { AuthNotice } from '../features/auth/AuthNotice';
import { SiteHeader } from '../features/auth/SiteHeader';
import { IdeaComposer } from '../features/composer/IdeaComposer';
import { FilterBar } from '../features/filters/FilterBar';
import { useUrlFilters } from '../features/filters/useUrlFilters';
import { IdeaBoard } from '../features/ideas/IdeaBoard';
import { IdeaDetailPanel } from '../features/ideas/IdeaDetailPanel';
import { demoIdeas } from '../features/ideas/demoIdeas';
import { useCreateIdeaMutation, useIdeasQuery, useUpdateIdeaMutation } from '../features/ideas/queries';
import { signIn, signOut } from '../lib/google/auth';
import { collectTags, filterAndSortIdeas } from '../lib/utils/search';
import { useNetworkState } from '../hooks/useNetworkState';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import type { Idea, IdeaUpdate } from '../types/idea';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '예상하지 못한 문제가 생겼습니다.';
}

export function App() {
  const auth = useAuthStore();
  const queryClient = useQueryClient();
  const isOnline = useNetworkState();
  const { filters, setFilters } = useUrlFilters();
  const { organizedMode, setOrganizedMode, selectedIdeaId, selectIdea } = useUiStore();
  const authenticated = Boolean(auth.accessToken);
  const ideasQuery = useIdeasQuery(authenticated);
  const createMutation = useCreateIdeaMutation();
  const updateMutation = useUpdateIdeaMutation();
  const [dismissedError, setDismissedError] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated && isOnline && ideasQuery.data?.source === 'cache') {
      void ideasQuery.refetch();
    }
  }, [authenticated, ideasQuery.data?.source, ideasQuery.refetch, isOnline]);

  const allIdeas = authenticated ? (ideasQuery.data?.ideas ?? []) : demoIdeas;
  const visibleIdeas = useMemo(() => filterAndSortIdeas(allIdeas, filters), [allIdeas, filters]);
  const availableTags = useMemo(() => collectTags(allIdeas.filter((idea) => idea.status !== 'dropped')), [allIdeas]);
  const selectedIdea = allIdeas.find((idea) => idea.id === selectedIdeaId) ?? null;
  const readOnly = !authenticated || !isOnline || !ideasQuery.data || ideasQuery.data.source === 'cache';

  const currentError =
    (ideasQuery.error ? getErrorMessage(ideasQuery.error) : null) ??
    (createMutation.error ? getErrorMessage(createMutation.error) : null) ??
    (updateMutation.error ? getErrorMessage(updateMutation.error) : null);
  const visibleError = currentError && currentError !== dismissedError ? currentError : null;

  const handleCreate = async (idea: Idea, files: File[]) => {
    await createMutation.mutateAsync({ idea, files });
  };

  const handleUpdate = async (current: Idea, changes: IdeaUpdate, newFiles: File[] = [], removedImageIds: string[] = []) => {
    await updateMutation.mutateAsync({ current, changes, newFiles, removedImageIds });
  };

  const handleSignIn = () => {
    if (auth.status !== 'unconfigured') {
      void signIn().catch(() => undefined);
    }
  };

  const handleSignOut = () => {
    selectIdea(null);
    queryClient.removeQueries({ queryKey: ['ideas'] });
    signOut();
  };

  const handleCloseDetail = useCallback(() => selectIdea(null), [selectIdea]);

  return (
    <div className={`app-shell ${organizedMode ? 'app-shell--organized' : ''}`}>
      <SiteHeader authStatus={auth.status} isOnline={isOnline} onSignIn={handleSignIn} onSignOut={handleSignOut} />
      <AuthNotice status={auth.status} error={auth.error} onSignIn={handleSignIn} />
      {ideasQuery.data?.warning ? <ErrorBanner message={ideasQuery.data.warning} onRetry={() => void ideasQuery.refetch()} /> : null}
      {visibleError ? <ErrorBanner message={visibleError} onRetry={() => void ideasQuery.refetch()} onDismiss={() => setDismissedError(visibleError)} /> : null}
      <IdeaComposer
        disabled={readOnly}
        disabledReason={
          !authenticated
            ? 'Google로 로그인하면 바로 입력할 수 있어요.'
            : !ideasQuery.data && ideasQuery.isPending
              ? 'Idea Box 폴더와 시트를 준비하고 있어요.'
              : !isOnline || ideasQuery.data?.source === 'cache'
              ? '오프라인에서는 초안을 보관하지만 새 아이디어를 저장할 수 없어요.'
              : undefined
        }
        saving={createMutation.isPending}
        onCreate={handleCreate}
      />
      <FilterBar
        filters={filters}
        availableTags={availableTags}
        organizedMode={organizedMode}
        resultCount={visibleIdeas.length}
        onFiltersChange={setFilters}
        onOrganizedModeChange={setOrganizedMode}
      />
      {authenticated && ideasQuery.isPending ? (
        <LoadingState />
      ) : (
        <IdeaBoard
          ideas={visibleIdeas}
          readOnly={readOnly}
          organizedMode={organizedMode}
          onOpen={selectIdea}
          onTogglePin={(idea) => void handleUpdate(idea, { pinned: !idea.pinned })}
        />
      )}
      {selectedIdea ? (
        <IdeaDetailPanel
          idea={selectedIdea}
          readOnly={readOnly}
          saving={updateMutation.isPending}
          onClose={handleCloseDetail}
          onSave={(changes, newFiles, removedImageIds) => handleUpdate(selectedIdea, changes, newFiles, removedImageIds)}
        />
      ) : null}
    </div>
  );
}
