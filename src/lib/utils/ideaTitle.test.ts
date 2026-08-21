import { extractIdeaTitle, resolveIdeaTitle } from './ideaTitle';

describe('idea title', () => {
  it('uses the first meaningful markdown line', () => {
    expect(extractIdeaTitle('\n## **새로운 지도**\n내용')).toBe('새로운 지도');
  });

  it('keeps an explicit title', () => {
    expect(resolveIdeaTitle('직접 쓴 제목', '# 본문 제목')).toBe('직접 쓴 제목');
  });
});
