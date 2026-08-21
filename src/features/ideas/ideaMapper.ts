import { IDEA_STATUSES, type Idea, type IdeaStatus } from '../../types/idea';

export const IDEA_HEADER = [
  'id',
  'createdAt',
  'updatedAt',
  'title',
  'body',
  'tags',
  'status',
  'pinned',
  'imageIds',
] as const;

export type IdeaSheetRow = [string, string, string, string, string, string, string, string, string];

function splitCommaList(value = ''): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isIdeaStatus(value: string): value is IdeaStatus {
  return IDEA_STATUSES.some((status) => status === value);
}

export function rowToIdea(row: readonly string[]): Idea | null {
  const id = row[0]?.trim();

  if (!id) {
    return null;
  }

  const statusValue = row[6] ?? 'seed';

  return {
    id,
    createdAt: row[1] ?? '',
    updatedAt: row[2] ?? row[1] ?? '',
    title: row[3] ?? '',
    body: row[4] ?? '',
    tags: splitCommaList(row[5]),
    status: isIdeaStatus(statusValue) ? statusValue : 'seed',
    pinned: (row[7] ?? '').toLocaleLowerCase() === 'true',
    imageIds: splitCommaList(row[8]),
  };
}

export function sheetValuesToIdeas(values: readonly (readonly string[])[]): Idea[] {
  return values.slice(1).map(rowToIdea).filter((idea): idea is Idea => idea !== null);
}

export function ideaToRow(idea: Idea): IdeaSheetRow {
  return [
    idea.id,
    idea.createdAt,
    idea.updatedAt,
    idea.title,
    idea.body,
    idea.tags.join(','),
    idea.status,
    String(idea.pinned),
    idea.imageIds.join(','),
  ];
}

export function findIdeaSheetRow(values: readonly (readonly string[])[], id: string): number | null {
  const dataIndex = values.slice(1).findIndex((row) => row[0] === id);
  return dataIndex === -1 ? null : dataIndex + 2;
}
