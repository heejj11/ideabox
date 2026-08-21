import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { demoIdeas } from './demoIdeas';
import { IdeaDetailPanel } from './IdeaDetailPanel';
import { ImageCleanupError } from './ideaRepository';

vi.mock('./IdeaImage', () => ({
  IdeaImage: ({
    alt,
    onOpen,
  }: {
    alt: string;
    onOpen?: (image: { src: string; alt: string }, trigger: HTMLButtonElement) => void;
  }) =>
    onOpen ? (
      <button
        type="button"
        aria-label={`${alt} 크게 보기`}
        onClick={(event) => onOpen({ src: 'blob:image', alt }, event.currentTarget)}
      >
        <img alt={alt} />
      </button>
    ) : (
      <img alt={alt} />
    ),
}));

describe('Idea detail attachment recovery', () => {
  beforeEach(() => {
    localStorage.clear();
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

  it('resizes the panel with the keyboard and remembers the width', () => {
    render(
      <IdeaDetailPanel
        idea={demoIdeas[0]!}
        readOnly={false}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const resizeHandle = screen.getByRole('separator', { name: '아이디어 패널 너비 조절' });
    expect(resizeHandle).toHaveAttribute('aria-valuenow', '920');

    fireEvent.keyDown(resizeHandle, { key: 'ArrowLeft' });

    expect(resizeHandle).toHaveAttribute('aria-valuenow', '944');
    expect(localStorage.getItem('idea-box:detail-panel-width')).toBe('944');
  });

  it('opens an attached image large and closes only the image on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <IdeaDetailPanel
        idea={{ ...demoIdeas[0]!, imageIds: ['idea-image'] }}
        readOnly={false}
        saving={false}
        onClose={onClose}
        onSave={vi.fn()}
      />
    );

    const imageButton = screen.getByRole('button', { name: `${demoIdeas[0]!.title} 첨부 이미지 1 크게 보기` });
    await user.click(imageButton);
    expect(screen.getByRole('dialog', { name: '이미지 크게 보기' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: '이미지 크게 보기' })).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(imageButton).toHaveFocus();
  });
});
