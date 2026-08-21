export const IDEA_STATUSES = ['seed', 'growing', 'done', 'dropped'] as const;

export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  seed: '씨앗',
  growing: '키우는 중',
  done: '완료',
  dropped: '내려놓음',
};

export type IdeaSort = 'newest' | 'oldest' | 'updated';

export interface OptimisticImage {
  key: string;
  name: string;
  url: string;
}

export interface Idea {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  body: string;
  tags: string[];
  status: IdeaStatus;
  pinned: boolean;
  imageIds: string[];
  optimisticImages?: OptimisticImage[];
  syncState?: 'pending' | 'failed' | 'cleanup-pending';
}

export interface IdeaDraft {
  title: string;
  body: string;
  tags: string[];
  status: IdeaStatus;
  pinned: boolean;
}

export interface NewIdeaInput extends IdeaDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  imageIds: string[];
}

export type IdeaUpdate = Partial<Pick<Idea, 'title' | 'body' | 'tags' | 'status' | 'pinned' | 'imageIds'>>;

export interface IdeaFilters {
  query: string;
  tags: string[];
  status: IdeaStatus | 'all';
  sort: IdeaSort;
}

export interface DraftAttachment {
  key: string;
  file: File;
  previewUrl: string;
}
