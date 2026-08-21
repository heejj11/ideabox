import { findIdeaSheetRow, ideaToRow, sheetValuesToIdeas } from './ideaMapper';

describe('idea sheet mapping', () => {
  const values = [
    ['id', 'createdAt', 'updatedAt', 'title', 'body', 'tags', 'status', 'pinned', 'imageIds'],
    ['a', '2026-08-01', '2026-08-02', '제목', '본문', '앱,메모', 'growing', 'true', 'img-1,img-2'],
  ];

  it('maps sheet rows into typed ideas', () => {
    expect(sheetValuesToIdeas(values)[0]).toMatchObject({
      id: 'a',
      tags: ['앱', '메모'],
      status: 'growing',
      pinned: true,
      imageIds: ['img-1', 'img-2'],
    });
  });

  it('uses the latest sheet values to calculate a row number by id', () => {
    expect(findIdeaSheetRow(values, 'a')).toBe(2);
    expect(findIdeaSheetRow(values, 'missing')).toBeNull();
  });

  it('serializes values without client-only fields', () => {
    const idea = sheetValuesToIdeas(values)[0]!;
    expect(ideaToRow(idea)).toEqual(values[1]);
  });
});
