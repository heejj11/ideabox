import { ideaFixtures } from '../../test/fixtures';
import { filterAndSortIdeas, matchesIdeaQuery } from './search';

describe('idea search and sorting', () => {
  it('searches title, body, and tags without case sensitivity', () => {
    expect(matchesIdeaQuery(ideaFixtures[0]!, 'ai')).toBe(true);
    expect(matchesIdeaQuery(ideaFixtures[1]!, '산책')).toBe(true);
  });

  it('keeps pinned ideas above the selected date order', () => {
    const result = filterAndSortIdeas(ideaFixtures, { query: '', tags: [], status: 'all', sort: 'newest' });
    expect(result[0]?.id).toBe('idea-a');
  });
});
