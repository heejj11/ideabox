import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { IDEA_STATUS_LABELS, IDEA_STATUSES, type DraftAttachment, type Idea, type IdeaStatus, type IdeaUpdate } from '../../types/idea';
import { resolveIdeaTitle } from '../../lib/utils/ideaTitle';
import { AttachmentPicker } from '../composer/AttachmentPicker';
import { ImageLightbox } from './ImageLightbox';
import { ImageCleanupError } from './ideaRepository';
import { IdeaImage, type IdeaImageOpenPayload } from './IdeaImage';
import { LocalSitePanel } from './LocalSitePanel';
import { MarkdownContent } from './MarkdownContent';

interface IdeaDetailPanelProps {
  idea: Idea;
  readOnly: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (changes: IdeaUpdate, newFiles: File[], removedImageIds: string[]) => Promise<void>;
}

const DETAIL_PANEL_WIDTH_KEY = 'idea-box:detail-panel-width';
const DEFAULT_DETAIL_PANEL_WIDTH = 920;
const MIN_DETAIL_PANEL_WIDTH = 620;
const MAX_DETAIL_PANEL_WIDTH = 1280;
const DETAIL_PANEL_VIEWPORT_GUTTER = 56;

function getMaximumPanelWidth(): number {
  return Math.min(
    MAX_DETAIL_PANEL_WIDTH,
    Math.max(MIN_DETAIL_PANEL_WIDTH, window.innerWidth - DETAIL_PANEL_VIEWPORT_GUTTER)
  );
}

function clampPanelWidth(width: number): number {
  return Math.min(getMaximumPanelWidth(), Math.max(MIN_DETAIL_PANEL_WIDTH, width));
}

function readPanelWidth(): number {
  const storedWidth = Number.parseInt(localStorage.getItem(DETAIL_PANEL_WIDTH_KEY) ?? '', 10);
  return clampPanelWidth(Number.isFinite(storedWidth) ? storedWidth : DEFAULT_DETAIL_PANEL_WIDTH);
}

function createAttachment(file: File): DraftAttachment {
  return {
    key: `${file.name}:${file.size}:${file.lastModified}:${crypto.randomUUID()}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function IdeaDetailPanel({ idea, readOnly, saving, onClose, onSave }: IdeaDetailPanelProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const attachmentsRef = useRef<DraftAttachment[]>([]);
  const resizeStartRef = useRef<{ pointerX: number; panelWidth: number } | null>(null);
  const lightboxTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [title, setTitle] = useState(idea.title);
  const [body, setBody] = useState(idea.body);
  const [tagsText, setTagsText] = useState(idea.tags.join(', '));
  const [status, setStatus] = useState<IdeaStatus>(idea.status);
  const [pinned, setPinned] = useState(idea.pinned);
  const [newAttachments, setNewAttachments] = useState<DraftAttachment[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState(readPanelWidth);
  const [lightboxImage, setLightboxImage] = useState<IdeaImageOpenPayload | null>(null);

  useEffect(() => {
    attachmentsRef.current = newAttachments;
  }, [newAttachments]);

  useEffect(
    () => () => {
      attachmentsRef.current.forEach((attachment) => URL.revokeObjectURL(attachment.previewUrl));
    },
    []
  );

  useEffect(() => {
    setTitle(idea.title);
    setBody(idea.body);
    setTagsText(idea.tags.join(', '));
    setStatus(idea.status);
    setPinned(idea.pinned);
    setRemovedImageIds([]);
    setNewAttachments([]);
    setError(null);
    setLightboxImage(null);
    window.setTimeout(() => (readOnly ? closeRef.current : titleRef.current)?.focus(), 0);
  }, [idea.id, readOnly]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (lightboxImage) {
          event.preventDefault();
          setLightboxImage(null);
          return;
        }
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = [
        ...panelRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'
        ),
      ];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, onClose]);

  useEffect(() => {
    document.body.classList.add('panel-open');
    return () => {
      document.body.classList.remove('panel-open');
      openerRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const handleViewportResize = () => setPanelWidth((current) => clampPanelWidth(current));
    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
  }, []);

  const visibleImageIds = useMemo(
    () => idea.imageIds.filter((imageId) => !removedImageIds.includes(imageId)),
    [idea.imageIds, removedImageIds]
  );

  const clearAttachmentChanges = () => {
    newAttachments.forEach((attachment) => URL.revokeObjectURL(attachment.previewUrl));
    setNewAttachments([]);
    setRemovedImageIds([]);
  };

  const persistPanelWidth = (width: number) => {
    const nextWidth = clampPanelWidth(width);
    setPanelWidth(nextWidth);
    localStorage.setItem(DETAIL_PANEL_WIDTH_KEY, String(nextWidth));
  };

  const handleResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    resizeStartRef.current = { pointerX: event.clientX, panelWidth };
    document.body.classList.add('panel-resizing');
  };

  const handleResizePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizeStartRef.current) return;
    const nextWidth = resizeStartRef.current.panelWidth + resizeStartRef.current.pointerX - event.clientX;
    setPanelWidth(clampPanelWidth(nextWidth));
  };

  const handleResizePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizeStartRef.current) return;
    resizeStartRef.current = null;
    document.body.classList.remove('panel-resizing');
    if (
      typeof event.currentTarget.hasPointerCapture === 'function' &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    localStorage.setItem(DETAIL_PANEL_WIDTH_KEY, String(panelWidth));
  };

  const handleResizeKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const widthStep = event.shiftKey ? 80 : 24;
    let nextWidth: number | null = null;

    if (event.key === 'ArrowLeft') nextWidth = panelWidth + widthStep;
    if (event.key === 'ArrowRight') nextWidth = panelWidth - widthStep;
    if (event.key === 'Home') nextWidth = MIN_DETAIL_PANEL_WIDTH;
    if (event.key === 'End') nextWidth = getMaximumPanelWidth();
    if (nextWidth === null) return;

    event.preventDefault();
    persistPanelWidth(nextWidth);
  };

  const panelStyle = { '--detail-panel-width': `${panelWidth}px` } as CSSProperties;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly || saving) return;
    if (!title.trim() && !body.trim()) {
      setError('제목이나 본문 중 하나는 남겨주세요.');
      return;
    }

    const changes: IdeaUpdate = {
      title: resolveIdeaTitle(title, body),
      body: body.trim(),
      tags: [...new Set(tagsText.split(',').map((tag) => tag.trim()).filter(Boolean))],
      status,
      pinned,
    };

    try {
      await onSave(
        changes,
        newAttachments.map((attachment) => attachment.file),
        removedImageIds
      );
      clearAttachmentChanges();
      setError(null);
    } catch (saveError) {
      if (saveError instanceof ImageCleanupError) {
        clearAttachmentChanges();
        setTitle(saveError.persistedIdea.title);
        setBody(saveError.persistedIdea.body);
        setTagsText(saveError.persistedIdea.tags.join(', '));
        setStatus(saveError.persistedIdea.status);
        setPinned(saveError.persistedIdea.pinned);
      }
      setError(saveError instanceof Error ? saveError.message : '아이디어를 수정하지 못했습니다.');
    }
  };

  return (
    <div className="detail-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside
        ref={panelRef}
        className="detail-panel"
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-panel-title"
      >
        <div
          className="detail-panel__resize-handle"
          role="separator"
          aria-label="아이디어 패널 너비 조절"
          aria-orientation="vertical"
          aria-valuemin={MIN_DETAIL_PANEL_WIDTH}
          aria-valuemax={getMaximumPanelWidth()}
          aria-valuenow={Math.round(panelWidth)}
          tabIndex={0}
          title="드래그하거나 좌우 방향키로 폭 조절 · 더블클릭으로 초기화"
          onDoubleClick={() => persistPanelWidth(DEFAULT_DETAIL_PANEL_WIDTH)}
          onKeyDown={handleResizeKeyDown}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerEnd}
          onPointerCancel={handleResizePointerEnd}
        />
        <header className="detail-panel__header">
          <div>
            <span>IDEA / {new Date(idea.createdAt).toLocaleDateString('ko-KR')}</span>
            <h2 id="detail-panel-title">아이디어 다듬기</h2>
          </div>
          <button ref={closeRef} type="button" className="text-button" onClick={onClose}>
            닫기
          </button>
        </header>
        <form className="detail-form" onSubmit={handleSubmit}>
          <label className="field field--stacked">
            <span>제목</span>
            <input ref={titleRef} value={title} onChange={(event) => setTitle(event.target.value)} disabled={readOnly || saving} />
          </label>
          <div className="detail-writing-grid">
            <label className="field field--stacked detail-writing-grid__editor">
              <span>본문 · Markdown</span>
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={14} disabled={readOnly || saving} />
            </label>
            {body ? (
              <section className="markdown-preview" aria-label="Markdown 미리보기">
                <span>미리보기</span>
                <MarkdownContent>{body}</MarkdownContent>
              </section>
            ) : null}
          </div>
          <LocalSitePanel markdown={body} />
          {visibleImageIds.length ? (
            <section className="detail-images" aria-label="현재 첨부 이미지">
              {visibleImageIds.map((fileId, index) => (
                <figure key={fileId}>
                  <IdeaImage
                    fileId={fileId}
                    alt={`${idea.title} 첨부 이미지 ${index + 1}`}
                    onOpen={(image, trigger) => {
                      lightboxTriggerRef.current = trigger;
                      setLightboxImage(image);
                    }}
                  />
                  <button
                    type="button"
                    className="attachment-remove-button"
                    disabled={readOnly || saving}
                    onClick={() => setRemovedImageIds((current) => [...current, fileId])}
                  >
                    첨부에서 제거
                  </button>
                </figure>
              ))}
            </section>
          ) : null}
          <AttachmentPicker
            compact
            attachments={newAttachments}
            onAddFiles={(files) => setNewAttachments((current) => [...current, ...files.map(createAttachment)])}
            onRemove={(key) => {
              setNewAttachments((current) => {
                const removed = current.find((attachment) => attachment.key === key);
                if (removed) URL.revokeObjectURL(removed.previewUrl);
                return current.filter((attachment) => attachment.key !== key);
              });
            }}
            disabled={readOnly || saving}
          />
          <div className="detail-fields-row">
            <label className="field field--stacked">
              <span>태그</span>
              <input value={tagsText} onChange={(event) => setTagsText(event.target.value)} disabled={readOnly || saving} />
            </label>
            <label className="field field--stacked">
              <span>상태</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as IdeaStatus)} disabled={readOnly || saving}>
                {IDEA_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {IDEA_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="check-field">
            <input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} disabled={readOnly || saving} />
            <span>목록 위에 고정</span>
          </label>
          {readOnly ? <p className="read-only-note">지금은 읽기 전용입니다. 온라인으로 다시 연결한 뒤 수정해 주세요.</p> : null}
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <footer className="detail-panel__actions">
            <button
              type="button"
              className="button button--danger"
              disabled={readOnly || saving}
              onClick={() => setStatus(status === 'dropped' ? 'seed' : 'dropped')}
            >
              {status === 'dropped' ? '다시 꺼내기' : '내려놓기'}
            </button>
            <button type="submit" className="button button--accent" disabled={readOnly || saving}>
              {saving ? '저장 중…' : '변경 저장'}
            </button>
          </footer>
        </form>
      </aside>
      {lightboxImage ? (
        <ImageLightbox
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
          returnFocusTo={lightboxTriggerRef.current}
        />
      ) : null}
    </div>
  );
}
