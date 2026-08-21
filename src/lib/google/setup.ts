import { GoogleApiError } from './client';
import {
  createDriveFolder,
  DRIVE_MIME_TYPES,
  findDriveFile,
  getDriveFile,
  moveDriveFile,
} from './drive';
import { createIdeaSpreadsheet, ensureIdeaSheetStructure, getSpreadsheet, writeIdeaHeader } from './sheets';

const WORKSPACE_CACHE_KEY = 'idea-box:workspace:v1';

export interface IdeaBoxWorkspace {
  folderId: string;
  imagesFolderId: string;
  spreadsheetId: string;
}

function readWorkspaceCache(): IdeaBoxWorkspace | null {
  const raw = localStorage.getItem(WORKSPACE_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<IdeaBoxWorkspace>;
    if (parsed.folderId && parsed.imagesFolderId && parsed.spreadsheetId) {
      return parsed as IdeaBoxWorkspace;
    }
  } catch {
    localStorage.removeItem(WORKSPACE_CACHE_KEY);
  }

  return null;
}

function cacheWorkspace(workspace: IdeaBoxWorkspace): void {
  localStorage.setItem(WORKSPACE_CACHE_KEY, JSON.stringify(workspace));
}

async function validateWorkspace(workspace: IdeaBoxWorkspace): Promise<boolean> {
  try {
    await Promise.all([
      getDriveFile(workspace.folderId),
      getDriveFile(workspace.imagesFolderId),
      getSpreadsheet(workspace.spreadsheetId),
    ]);
    return true;
  } catch (error) {
    if (error instanceof GoogleApiError && (error.status === 403 || error.status === 404)) {
      return false;
    }
    throw error;
  }
}

async function findOrCreateFolder(name: string, parentId?: string): Promise<string> {
  const existing = await findDriveFile(name, DRIVE_MIME_TYPES.folder, parentId);
  return existing?.id ?? (await createDriveFolder(name, parentId)).id;
}

async function findOrCreateSpreadsheet(folderId: string): Promise<string> {
  const existing = await findDriveFile('ideas', DRIVE_MIME_TYPES.spreadsheet, folderId);
  if (existing) {
    await ensureIdeaSheetStructure(existing.id);
    return existing.id;
  }

  const spreadsheetId = await createIdeaSpreadsheet();
  await moveDriveFile(spreadsheetId, folderId);
  return spreadsheetId;
}

export async function ensureIdeaBoxWorkspace(): Promise<IdeaBoxWorkspace> {
  const cached = readWorkspaceCache();
  if (cached && (await validateWorkspace(cached))) {
    return cached;
  }

  if (cached) {
    localStorage.removeItem(WORKSPACE_CACHE_KEY);
  }

  const folderId = await findOrCreateFolder('IdeaBox');
  const imagesFolderId = await findOrCreateFolder('images', folderId);
  const spreadsheetId = await findOrCreateSpreadsheet(folderId);
  const workspace = { folderId, imagesFolderId, spreadsheetId };
  cacheWorkspace(workspace);
  return workspace;
}

export async function repairIdeaSheetHeader(workspace: IdeaBoxWorkspace): Promise<void> {
  await writeIdeaHeader(workspace.spreadsheetId);
}

export function clearWorkspaceCache(): void {
  localStorage.removeItem(WORKSPACE_CACHE_KEY);
}
