import { googleBlob, googleFetch, googleJson, scheduleGoogleWrite } from './client';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const SPREADSHEET_MIME_TYPE = 'application/vnd.google-apps.spreadsheet';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
}

interface DriveFileListResponse {
  files?: DriveFile[];
  nextPageToken?: string;
}

function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export async function findDriveFile(name: string, mimeType: string, parentId?: string): Promise<DriveFile | null> {
  const clauses = [
    `name = '${escapeDriveQueryValue(name)}'`,
    `mimeType = '${escapeDriveQueryValue(mimeType)}'`,
    'trashed = false',
  ];

  if (parentId) {
    clauses.push(`'${escapeDriveQueryValue(parentId)}' in parents`);
  }

  const params = new URLSearchParams({
    q: clauses.join(' and '),
    fields: 'files(id,name,mimeType,parents)',
    pageSize: '10',
    orderBy: 'createdTime asc',
  });
  const response = await googleJson<DriveFileListResponse>(`${DRIVE_API}/files?${params}`);
  return response.files?.[0] ?? null;
}

export async function getDriveFile(fileId: string): Promise<DriveFile> {
  const params = new URLSearchParams({ fields: 'id,name,mimeType,parents' });
  return googleJson<DriveFile>(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?${params}`);
}

export async function createDriveFolder(name: string, parentId?: string): Promise<DriveFile> {
  return scheduleGoogleWrite(() =>
    googleJson<DriveFile>(`${DRIVE_API}/files?fields=id,name,mimeType,parents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        mimeType: FOLDER_MIME_TYPE,
        ...(parentId ? { parents: [parentId] } : {}),
      }),
    })
  );
}

export async function moveDriveFile(fileId: string, parentId: string): Promise<DriveFile> {
  const current = await getDriveFile(fileId);
  const params = new URLSearchParams({
    addParents: parentId,
    removeParents: current.parents?.join(',') ?? '',
    fields: 'id,name,mimeType,parents',
  });
  return scheduleGoogleWrite(() =>
    googleJson<DriveFile>(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?${params}`, { method: 'PATCH' })
  );
}

export async function uploadDriveImage(file: File, imagesFolderId: string): Promise<DriveFile> {
  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify({ name: file.name, parents: [imagesFolderId] })], { type: 'application/json' })
  );
  formData.append('file', file, file.name);

  const params = new URLSearchParams({ uploadType: 'multipart', fields: 'id,name,mimeType,parents' });
  return scheduleGoogleWrite(() =>
    googleJson<DriveFile>(`${DRIVE_UPLOAD_API}/files?${params}`, {
      method: 'POST',
      body: formData,
    })
  );
}

export async function downloadDriveImage(fileId: string): Promise<Blob> {
  return googleBlob(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`);
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  await scheduleGoogleWrite(() => googleFetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}`, { method: 'DELETE' }));
}

export const DRIVE_MIME_TYPES = {
  folder: FOLDER_MIME_TYPE,
  spreadsheet: SPREADSHEET_MIME_TYPE,
} as const;
