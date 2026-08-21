import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { demoIdeas } from './demoIdeas';
import { IdeaDetailPanel } from './IdeaDetailPanel';
import { ImageCleanupError } from './ideaRepository';

vi.mock('./IdeaImage', () => ({
  IdeaImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

describe('Idea detail attachment recovery', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:preview') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('clears pending files after the edit was saved but Drive cleanup failed', async () => {
    const user = userEvent.setup();
    const persistedIdea = { ...demoIdeas[0]!, body: '저장된 본문', imageIds: [] };
    const onSave = vi.fn().mockRejectedValue(new ImageCleanupError('이미지 정리 대기', persistedIdea));
    const { container } = render(
      <IdeaDetailPanel
        idea={{ ...demoIdeas[0]!, imageIds: ['old-image'] }}
        readOnly={false}
        saving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(fileInput).not.toBeNull();
    await user.upload(fileInput!, new File(['preview'], 'sketch.png', { type: 'image/png' }));
    await user.click(screen.getByRole('button', { name: '첨부에서 제거' }));
    await user.click(screen.getByRole('button', { name: '변경 저장' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('이미지 정리 대기'));
    expect(screen.queryByAltText('sketch.png')).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');

    await user.click(screen.getByRole('button', { name: '변경 저장' }));
    expect(onSave).toHaveBeenLastCalledWith(expect.any(Object), [], []);
  });
});
