import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Idea, IdeaDraft } from '../../types/idea';

export interface CachedDraftAttachment {
  key: string;
  file: File;
}

export interface CachedComposerDraft extends IdeaDraft {
  attachments: CachedDraftAttachment[];
  savedAt: string;
}

interface IdeasCacheEntry {
  key: 'latest';
  ideas: Idea[];
  cachedAt: string;
}

interface ImageCacheEntry {
  fileId: string;
  blob: Blob;
  cachedAt: string;
}

interface DraftCacheEntry {
  key: 'composer';
  draft: CachedComposerDraft;
}

interface PendingImageDeleteEntry {
  fileId: string;
  queuedAt: string;
}

interface IdeaBoxDatabase extends DBSchema {
  ideas: {
    key: 'latest';
    value: IdeasCacheEntry;
  };
  images: {
    key: string;
    value: ImageCacheEntry;
    indexes: { 'by-cached-at': string };
  };
  drafts: {
    key: 'composer';
    value: DraftCacheEntry;
  };
  pendingImageDeletes: {
    key: string;
    value: PendingImageDeleteEntry;
  };
}

let databasePromise: Promise<IDBPDatabase<IdeaBoxDatabase>> | null = null;

function getDatabase(): Promise<IDBPDatabase<IdeaBoxDatabase>> {
  databasePromise ??= openDB<IdeaBoxDatabase>('idea-box', 2, {
    upgrade(database, oldVersion) {
      if (oldVersion < 1) {
        database.createObjectStore('ideas', { keyPath: 'key' });
        const imageStore = database.createObjectStore('images', { keyPath: 'fileId' });
        imageStore.createIndex('by-cached-at', 'cachedAt');
        database.createObjectStore('drafts', { keyPath: 'key' });
      }
      if (oldVersion < 2) {
        database.createObjectStore('pendingImageDeletes', { keyPath: 'fileId' });
      }
    },
  });

  return databasePromise;
}

export async function cacheIdeas(ideas: Idea[]): Promise<void> {
  const database = await getDatabase();
  const safeIdeas = ideas.map(({ optimisticImages: _optimisticImages, syncState: _syncState, ...idea }) => idea);
  await database.put('ideas', { key: 'latest', ideas: safeIdeas, cachedAt: new Date().toISOString() });
}

export async function getCachedIdeas(): Promise<IdeasCacheEntry | null> {
  const database = await getDatabase();
  return (await database.get('ideas', 'latest')) ?? null;
}

export async function cacheImage(fileId: string, blob: Blob): Promise<void> {
  const database = await getDatabase();
  await database.put('images', { fileId, blob, cachedAt: new Date().toISOString() });
}

export async function getCachedImage(fileId: string): Promise<Blob | null> {
  const database = await getDatabase();
  return (await database.get('images', fileId))?.blob ?? null;
}

export async function removeCachedImage(fileId: string): Promise<void> {
  const database = await getDatabase();
  await database.delete('images', fileId);
}

export async function cacheComposerDraft(draft: CachedComposerDraft): Promise<void> {
  const database = await getDatabase();
  await database.put('drafts', { key: 'composer', draft });
}

export async function getCachedComposerDraft(): Promise<CachedComposerDraft | null> {
  const database = await getDatabase();
  return (await database.get('drafts', 'composer'))?.draft ?? null;
}

export async function clearComposerDraft(): Promise<void> {
  const database = await getDatabase();
  await database.delete('drafts', 'composer');
}

export async function queuePendingImageDelete(fileId: string): Promise<void> {
  const database = await getDatabase();
  await database.put('pendingImageDeletes', { fileId, queuedAt: new Date().toISOString() });
}

export async function getPendingImageDeletes(): Promise<string[]> {
  const database = await getDatabase();
  return (await database.getAllKeys('pendingImageDeletes')).map(String);
}

export async function clearPendingImageDelete(fileId: string): Promise<void> {
  const database = await getDatabase();
  await database.delete('pendingImageDeletes', fileId);
}

export function resetDatabaseConnectionForTests(): void {
  databasePromise = null;
}
