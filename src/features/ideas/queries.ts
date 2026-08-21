import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cacheIdeas } from '../../lib/storage/database';
import type { Idea } from '../../types/idea';
import {
  loadIdeaImage,
  loadIdeas,
  persistIdeaUpdate,
  persistNewIdea,
  type CreateIdeaCommand,
  type IdeasSnapshot,
  type UpdateIdeaCommand,
  ImageCleanupError,
} from './ideaRepository';

export const ideaKeys = {
  all: ['ideas'] as const,
  image: (fileId: string) => ['ideas', 'image', fileId] as const,
};

export function useIdeasQuery(enabled: boolean) {
  return useQuery({
    queryKey: ideaKeys.all,
    queryFn: loadIdeas,
    enabled,
  });
}

export function useIdeaImageQuery(fileId: string, enabled = true) {
  return useQuery({
    queryKey: ideaKeys.image(fileId),
    queryFn: () => loadIdeaImage(fileId),
    enabled: enabled && Boolean(fileId),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

function replaceIdea(snapshot: IdeasSnapshot | undefined, idea: Idea): IdeasSnapshot | undefined {
  if (!snapshot) {
    return snapshot;
  }

  return {
    ...snapshot,
    ideas: snapshot.ideas.map((existing) => (existing.id === idea.id ? idea : existing)),
  };
}

export function useCreateIdeaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: persistNewIdea,
    onMutate: async (command: CreateIdeaCommand) => {
      await queryClient.cancelQueries({ queryKey: ideaKeys.all });
      const previous = queryClient.getQueryData<IdeasSnapshot>(ideaKeys.all);
      const optimisticIdea = { ...command.idea, syncState: 'pending' as const };
      queryClient.setQueryData<IdeasSnapshot>(ideaKeys.all, {
        ideas: [optimisticIdea, ...(previous?.ideas ?? [])],
        source: previous?.source ?? 'network',
      });
      return { previous };
    },
    onError: (error, _command, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ideaKeys.all, context.previous);
      }
    },
    onSuccess: (idea) => {
      queryClient.setQueryData<IdeasSnapshot>(ideaKeys.all, (snapshot) => replaceIdea(snapshot, idea));
      const latest = queryClient.getQueryData<IdeasSnapshot>(ideaKeys.all);
      if (latest) void cacheIdeas(latest.ideas);
    },
  });
}

export function useUpdateIdeaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: persistIdeaUpdate,
    onMutate: async (command: UpdateIdeaCommand) => {
      await queryClient.cancelQueries({ queryKey: ideaKeys.all });
      const previous = queryClient.getQueryData<IdeasSnapshot>(ideaKeys.all);
      const optimistic: Idea = {
        ...command.current,
        ...command.changes,
        updatedAt: new Date().toISOString(),
        imageIds: command.current.imageIds.filter((id) => !command.removedImageIds.includes(id)),
        optimisticImages: command.newFiles.map((file) => ({
          key: `${file.name}:${file.size}:${file.lastModified}`,
          name: file.name,
          url: URL.createObjectURL(file),
        })),
        syncState: 'pending',
      };
      queryClient.setQueryData<IdeasSnapshot>(ideaKeys.all, (snapshot) => replaceIdea(snapshot, optimistic));
      return { previous, optimistic };
    },
    onError: (error, _command, context) => {
      if (error instanceof ImageCleanupError) {
        const persistedWithWarning = { ...error.persistedIdea, syncState: 'cleanup-pending' as const };
        queryClient.setQueryData<IdeasSnapshot>(ideaKeys.all, (snapshot) => replaceIdea(snapshot, persistedWithWarning));
        const latest = queryClient.getQueryData<IdeasSnapshot>(ideaKeys.all);
        if (latest) void cacheIdeas(latest.ideas);
      } else if (context?.previous) {
        queryClient.setQueryData(ideaKeys.all, context.previous);
      }
    },
    onSuccess: (idea) => {
      queryClient.setQueryData<IdeasSnapshot>(ideaKeys.all, (snapshot) => replaceIdea(snapshot, idea));
      const latest = queryClient.getQueryData<IdeasSnapshot>(ideaKeys.all);
      if (latest) void cacheIdeas(latest.ideas);
    },
    onSettled: (_idea, _error, _command, context) => {
      context?.optimistic.optimisticImages?.forEach((image) => URL.revokeObjectURL(image.url));
    },
  });
}
