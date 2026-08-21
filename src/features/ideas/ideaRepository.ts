import {
  cacheIdeas,
  cacheImage,
  clearPendingImageDelete,
  getCachedIdeas,
  getCachedImage,
  getPendingImageDeletes,
  queuePendingImageDelete,
  removeCachedImage,
} from '../../lib/storage/database';
import { GoogleApiError } from '../../lib/google/client';
import { deleteDriveFile, downloadDriveImage, uploadDriveImage } from '../../lib/google/drive';
import { ensureIdeaBoxWorkspace } from '../../lib/google/setup';
import { appendIdea, getIdeas, updateIdea } from '../../lib/google/sheets';
import type { Idea, IdeaUpdate } from '../../types/idea';

export interface IdeasSnapshot {
  ideas: Idea[];
  source: 'network' | 'cache';
  cachedAt?: string;
  warning?: string;
}

export interface CreateIdeaCommand {
  idea: Idea;
  files: File[];
}

export interface UpdateIdeaCommand {
  current: Idea;
  changes: IdeaUpdate;
  newFiles: File[];
  removedImageIds: string[];
}

export class ImageCleanupError extends Error {
  constructor(
    message: string,
    public readonly persistedIdea: Idea
  ) {
    super(message);
    this.name = 'ImageCleanupError';
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Google에서 아이디어를 불러오지 못했습니다.';
}

export async function loadIdeas(): Promise<IdeasSnapshot> {
  try {
    if (!navigator.onLine) {
      throw new Error('인터넷 연결이 없습니다.');
    }

    const workspace = await ensureIdeaBoxWorkspace();
    const cleanupFailures = await retryPendingImageDeletes();
    const ideas = await getIdeas(workspace.spreadsheetId);
    await cacheIdeas(ideas);
    return {
      ideas,
      source: 'network',
      warning: cleanupFailures
        ? `이전에 제거한 이미지 ${cleanupFailures}개의 Drive 원본을 아직 정리하지 못했습니다. 다음 연결 때 다시 시도합니다.`
        : undefined,
    };
  } catch (error) {
    const cached = await getCachedIdeas();
    if (cached) {
      return {
        ideas: cached.ideas,
        source: 'cache',
        cachedAt: cached.cachedAt,
        warning: `${errorMessage(error)} 마지막으로 저장된 목록을 읽기 전용으로 보여드립니다.`,
      };
    }
    throw error;
  }
}

export async function persistNewIdea(command: CreateIdeaCommand): Promise<Idea> {
  const workspace = await ensureIdeaBoxWorkspace();
  const uploadedIds: string[] = [];

  try {
    for (const file of command.files) {
      const uploaded = await uploadDriveImage(file, workspace.imagesFolderId);
      uploadedIds.push(uploaded.id);
    }

    const idea: Idea = {
      ...command.idea,
      imageIds: [...command.idea.imageIds, ...uploadedIds],
      optimisticImages: undefined,
      syncState: undefined,
    };
    await appendIdea(workspace.spreadsheetId, idea);
    return idea;
  } catch (error) {
    await Promise.allSettled(uploadedIds.map((fileId) => deleteDriveFile(fileId)));
    throw error;
  }
}

export async function persistIdeaUpdate(command: UpdateIdeaCommand): Promise<Idea> {
  const workspace = await ensureIdeaBoxWorkspace();
  const uploadedIds: string[] = [];
  let idea: Idea;

  try {
    for (const file of command.newFiles) {
      const uploaded = await uploadDriveImage(file, workspace.imagesFolderId);
      uploadedIds.push(uploaded.id);
    }

    const retainedImages = command.current.imageIds.filter((imageId) => !command.removedImageIds.includes(imageId));
    idea = {
      ...command.current,
      ...command.changes,
      updatedAt: new Date().toISOString(),
      imageIds: [...retainedImages, ...uploadedIds],
      optimisticImages: undefined,
      syncState: undefined,
    };
    await updateIdea(workspace.spreadsheetId, idea);
  } catch (error) {
    await Promise.allSettled(uploadedIds.map((fileId) => deleteDriveFile(fileId)));
    throw error;
  }

  const failedDeletes: string[] = [];
  await Promise.all(
    command.removedImageIds.map(async (fileId) => {
      try {
        await deleteDriveFile(fileId);
        await removeCachedImage(fileId);
        await clearPendingImageDelete(fileId);
      } catch {
        failedDeletes.push(fileId);
        await queuePendingImageDelete(fileId).catch(() => undefined);
      }
    })
  );

  if (failedDeletes.length) {
    throw new ImageCleanupError(
      `아이디어 변경은 저장했지만 이미지 ${failedDeletes.length}개의 Drive 원본을 삭제하지 못했습니다. 다음 연결 때 자동으로 다시 시도합니다.`,
      idea
    );
  }

  return idea;
}

async function retryPendingImageDeletes(): Promise<number> {
  const pending = await getPendingImageDeletes();
  let failures = 0;

  for (const fileId of pending) {
    try {
      await deleteDriveFile(fileId);
      await removeCachedImage(fileId);
      await clearPendingImageDelete(fileId);
    } catch (error) {
      if (error instanceof GoogleApiError && error.status === 404) {
        await clearPendingImageDelete(fileId);
      } else {
        failures += 1;
      }
    }
  }

  return failures;
}

export async function loadIdeaImage(fileId: string): Promise<Blob> {
  const cached = await getCachedImage(fileId);
  if (cached) {
    return cached;
  }

  const blob = await downloadDriveImage(fileId);
  await cacheImage(fileId, blob);
  return blob;
}
