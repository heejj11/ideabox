import { useEffect, useState } from 'react';
import type { IdeaFilters, IdeaSort, IdeaStatus } from '../../types/idea';

interface FilterBarProps {
  filters: IdeaFilters;
  availableTags: string[];
  organizedMode: boolean;
  resultCount: number;
  onFiltersChange: (filters: IdeaFilters) => void;
  onOrganizedModeChange: (enabled: boolean) => void;
}

export function FilterBar({
  filters,
  availableTags,
  organizedMode,
  resultCount,
  onFiltersChange,
  onOrganizedModeChange,
}: FilterBarProps) {
  const [query, setQuery] = useState(filters.query);

  useEffect(() => {
    setQuery(filters.query);
  }, [filters.query]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (query !== filters.query) {
        onFiltersChange({ ...filters, query });
      }
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [filters, onFiltersChange, query]);

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag) ? filters.tags.filter((current) => current !== tag) : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags });
  };

  return (
    <section className="filter-bar" aria-label="아이디어 검색과 필터">
      <label className="search-field">
        <span className="sr-only">아이디어 찾기</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="아이디어 찾기" type="search" />
      </label>
      <div className="filter-bar__selects">
        <label>
          <span className="sr-only">상태 필터</span>
          <select
            value={filters.status}
            onChange={(event) => onFiltersChange({ ...filters, status: event.target.value as IdeaStatus | 'all' })}
          >
            <option value="all">진행 중 전체</option>
            <option value="seed">씨앗</option>
            <option value="growing">키우는 중</option>
            <option value="done">완료</option>
            <option value="dropped">내려놓음</option>
          </select>
        </label>
        <label>
          <span className="sr-only">정렬</span>
          <select
            value={filters.sort}
            onChange={(event) => onFiltersChange({ ...filters, sort: event.target.value as IdeaSort })}
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="updated">수정순</option>
          </select>
        </label>
        <label className="organize-toggle">
          <input
            type="checkbox"
            checked={organizedMode}
            onChange={(event) => onOrganizedModeChange(event.target.checked)}
          />
          <span>정리 모드</span>
        </label>
      </div>
      {availableTags.length ? (
        <div className="tag-filter-list" aria-label="태그 필터">
          {availableTags.map((tag) => (
            <button key={tag} type="button" aria-pressed={filters.tags.includes(tag)} onClick={() => toggleTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
      ) : null}
      <p className="result-count" aria-live="polite">
        {resultCount}개의 생각 조각
      </p>
    </section>
  );
}
