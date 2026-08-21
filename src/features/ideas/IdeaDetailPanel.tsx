import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { IDEA_STATUS_LABELS, IDEA_STATUSES, type DraftAttachment, type Idea, type IdeaStatus, type IdeaUpdate } from '../../types/idea';
import { resolveIdeaTitle } from '../../lib/utils/ideaTitle';
import { AttachmentPicker } from '../composer/AttachmentPicker';
import { ImageCleanupError } from './ideaRepository';
import { IdeaImage } from './IdeaImage';
import { MarkdownContent } from './MarkdownContent';

interface IdeaDetailPanelProps {
  idea: Idea;
  readOnly: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (changes: IdeaUpdate, newFiles: File[], removedImageIds: string[]) => Promise<void>;
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
  const [title, setTitle] = useState(idea.title);
  const [body, setBody] = useState(idea.body);
  const [tagsText, setTagsText] = useState(idea.tags.join(', '));
  const [status, setStatus] = useState<IdeaStatus>(idea.status);
  const [pinned, setPinned] = useState(idea.pinned);
  const [newAttachments, setNewAttachments] = useState<DraftAttachment[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    window.setTimeout(() => (readOnly ? closeRef.current : titleRef.current)?.focus(), 0);
  }, [idea.id, readOnly]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
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
    document.body.classList.add('panel-open');
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('panel-open');
      window.removeEventListener('keydown', handleKeyDown);
      openerRef.current?.focus();
    };
  }, [onClose]);

  const visibleImageIds = useMemo(
    () => idea.imageIds.filter((imageId) => !removedImageIds.includes(imageId)),
    [idea.imageIds, removedImageIds]
  );

  const clearAttachmentChanges = () => {
    newAttachments.forEach((attachment) => URL.revokeObjectURL(attachment.previewUrl));
    setNewAttachments([]);
    setRemovedImageIds([]);
  };

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
      <aside ref={panelRef} className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-panel-title">
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
          <label className="field field--stacked">
            <span>본문 · Markdown</span>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={9} disabled={readOnly || saving} />
          </label>
          {body ? (
            <section className="markdown-preview" aria-label="Markdown 미리보기">
              <span>미리보기</span>
              <MarkdownContent>{body}</MarkdownContent>
            </section>
          ) : null}
          {visibleImageIds.length ? (
            <section className="detail-images" aria-label="현재 첨부 이미지">
              {visibleImageIds.map((fileId, index) => (
                <figure key={fileId}>
                  <IdeaImage fileId={fileId} alt={`${idea.title} 첨부 이미지 ${index + 1}`} />
                  <button
                    type="button"
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
    </div>
  );
}
