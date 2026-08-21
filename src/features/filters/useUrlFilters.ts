import { useCallback, useEffect, useState } from 'react';
import { IDEA_STATUSES, type IdeaFilters, type IdeaSort, type IdeaStatus } from '../../types/idea';

const SORTS: IdeaSort[] = ['newest', 'oldest', 'updated'];

function isStatus(value: string | null): value is IdeaStatus {
  return value !== null && IDEA_STATUSES.some((status) => status === value);
}

function isSort(value: string | null): value is IdeaSort {
  return value !== null && SORTS.some((sort) => sort === value);
}

function readFilters(): IdeaFilters {
  const params = new URLSearchParams(window.location.search);
  const rawTags = params.get('tags');
  const status = params.get('status');
  const sort = params.get('sort');
  return {
    query: params.get('q') ?? '',
    tags: rawTags ? rawTags.split(',').filter(Boolean) : [],
    status: isStatus(status) ? status : 'all',
    sort: isSort(sort) ? sort : 'newest',
  };
}

function writeFilters(filters: IdeaFilters): void {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.tags.length) params.set('tags', filters.tags.join(','));
  if (filters.status !== 'all') params.set('status', filters.status);
  if (filters.sort !== 'newest') params.set('sort', filters.sort);
  const search = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`);
}

export function useUrlFilters() {
  const [filters, setFiltersState] = useState<IdeaFilters>(readFilters);

  useEffect(() => {
    const handlePopState = () => setFiltersState(readFilters());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setFilters = useCallback((next: IdeaFilters | ((current: IdeaFilters) => IdeaFilters)) => {
    setFiltersState((current) => {
      const value = typeof next === 'function' ? next(current) : next;
      writeFilters(value);
      return value;
    });
  }, []);

  return { filters, setFilters };
}
