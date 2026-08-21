import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { demoIdeas } from './demoIdeas';

const storageMocks = vi.hoisted(() => ({
  cacheIdeas: vi.fn(),
  cacheImage: vi.fn(),
  clearPendingImageDelete: vi.fn(),
  getCachedIdeas: vi.fn(),
  getCachedImage: vi.fn(),
  getPendingImageDeletes: vi.fn(),
  queuePendingImageDelete: vi.fn(),
  removeCachedImage: vi.fn(),
}));

const driveMocks = vi.hoisted(() => ({
  deleteDriveFile: vi.fn(),
  downloadDriveImage: vi.fn(),
  uploadDriveImage: vi.fn(),
}));

const setupMocks = vi.hoisted(() => ({
  ensureIdeaBoxWorkspace: vi.fn(),
}));

const sheetsMocks = vi.hoisted(() => ({
  appendIdea: vi.fn(),
  getIdeas: vi.fn(),
  updateIdea: vi.fn(),
}));

vi.mock('../../lib/storage/database', () => storageMocks);
vi.mock('../../lib/google/drive', () => driveMocks);
vi.mock('../../lib/google/setup', () => setupMocks);
vi.mock('../../lib/google/sheets', () => sheetsMocks);

import { ImageCleanupError, loadIdeas, persistIdeaUpdate } from './ideaRepository';

describe('idea repository resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks.ensureIdeaBoxWorkspace.mockResolvedValue({
      folderId: 'folder',
      imagesFolderId: 'images',
      spreadsheetId: 'sheet',
    });
    storageMocks.getPendingImageDeletes.mockResolvedValue([]);
    storageMocks.cacheIdeas.mockResolvedValue(undefined);
    storageMocks.queuePendingImageDelete.mockResolvedValue(undefined);
    sheetsMocks.updateIdea.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the last cached list as read-only data while offline', async () => {
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
    storageMocks.getCachedIdeas.mockResolvedValue({
      key: 'latest',
      ideas: demoIdeas,
      cachedAt: '2026-08-21T08:00:00.000Z',
    });

    await expect(loadIdeas()).resolves.toMatchObject({
      ideas: demoIdeas,
      source: 'cache',
      cachedAt: '2026-08-21T08:00:00.000Z',
    });
    expect(setupMocks.ensureIdeaBoxWorkspace).not.toHaveBeenCalled();
    expect(sheetsMocks.getIdeas).not.toHaveBeenCalled();
  });

  it('keeps a saved edit and queues failed Drive image cleanup', async () => {
    const current = { ...demoIdeas[0]!, imageIds: ['old-image'] };
    driveMocks.deleteDriveFile.mockRejectedValue(new Error('Drive unavailable'));

    const result = persistIdeaUpdate({
      current,
      changes: { body: '수정된 본문' },
      newFiles: [],
      removedImageIds: ['old-image'],
    });

    await expect(result).rejects.toBeInstanceOf(ImageCleanupError);
    await expect(result).rejects.toMatchObject({
      persistedIdea: expect.objectContaining({ body: '수정된 본문', imageIds: [] }),
    });
    expect(sheetsMocks.updateIdea).toHaveBeenCalledOnce();
    expect(storageMocks.queuePendingImageDelete).toHaveBeenCalledWith('old-image');
  });
});
