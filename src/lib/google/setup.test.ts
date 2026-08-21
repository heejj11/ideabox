import { beforeEach, describe, expect, it, vi } from 'vitest';

const driveMocks = vi.hoisted(() => ({
  createDriveFolder: vi.fn(),
  DRIVE_MIME_TYPES: {
    folder: 'application/vnd.google-apps.folder',
    spreadsheet: 'application/vnd.google-apps.spreadsheet',
  },
  findDriveFile: vi.fn(),
  getDriveFile: vi.fn(),
  moveDriveFile: vi.fn(),
}));

const sheetsMocks = vi.hoisted(() => ({
  createIdeaSpreadsheet: vi.fn(),
  ensureIdeaSheetStructure: vi.fn(),
  getSpreadsheet: vi.fn(),
  writeIdeaHeader: vi.fn(),
}));

vi.mock('./drive', () => driveMocks);
vi.mock('./sheets', () => sheetsMocks);

import { ensureIdeaBoxWorkspace } from './setup';

describe('Google workspace setup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('creates the folder tree and spreadsheet, then caches their IDs', async () => {
    driveMocks.findDriveFile.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    driveMocks.createDriveFolder
      .mockResolvedValueOnce({ id: 'folder-id', name: 'IdeaBox' })
      .mockResolvedValueOnce({ id: 'images-id', name: 'images' });
    sheetsMocks.createIdeaSpreadsheet.mockResolvedValue('sheet-id');
    driveMocks.moveDriveFile.mockResolvedValue({ id: 'sheet-id', name: 'ideas' });

    await expect(ensureIdeaBoxWorkspace()).resolves.toEqual({
      folderId: 'folder-id',
      imagesFolderId: 'images-id',
      spreadsheetId: 'sheet-id',
    });
    expect(driveMocks.createDriveFolder).toHaveBeenNthCalledWith(1, 'IdeaBox', undefined);
    expect(driveMocks.createDriveFolder).toHaveBeenNthCalledWith(2, 'images', 'folder-id');
    expect(driveMocks.moveDriveFile).toHaveBeenCalledWith('sheet-id', 'folder-id');
    expect(JSON.parse(localStorage.getItem('idea-box:workspace:v1') ?? '{}')).toEqual({
      folderId: 'folder-id',
      imagesFolderId: 'images-id',
      spreadsheetId: 'sheet-id',
    });
  });
});
