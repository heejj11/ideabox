import type { Idea, IdeaFilters } from '../../types/idea';

function normalize(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('ko-KR').trim();
}

export function matchesIdeaQuery(idea: Idea, query: string): boolean {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return true;
  }

  return normalize([idea.title, idea.body, ...idea.tags].join('\n')).includes(normalizedQuery);
}

export function filterAndSortIdeas(ideas: Idea[], filters: IdeaFilters): Idea[] {
  const filtered = ideas.filter((idea) => {
    const matchesStatus = filters.status === 'all' ? idea.status !== 'dropped' : idea.status === filters.status;
    const matchesTags = filters.tags.every((tag) => idea.tags.includes(tag));
    return matchesStatus && matchesTags && matchesIdeaQuery(idea, filters.query);
  });

  return [...filtered].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }

    if (filters.sort === 'oldest') {
      return left.createdAt.localeCompare(right.createdAt);
    }

    const field = filters.sort === 'updated' ? 'updatedAt' : 'createdAt';
    return right[field].localeCompare(left[field]);
  });
}

export function collectTags(ideas: Idea[]): string[] {
  return [...new Set(ideas.flatMap((idea) => idea.tags))].sort((left, right) => left.localeCompare(right, 'ko'));
}
