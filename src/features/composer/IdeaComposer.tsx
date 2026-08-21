import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import {
  cacheComposerDraft,
  clearComposerDraft,
  getCachedComposerDraft,
  type CachedComposerDraft,
} from '../../lib/storage/database';
import { resolveIdeaTitle } from '../../lib/utils/ideaTitle';
import type { DraftAttachment, Idea, IdeaStatus } from '../../types/idea';
import { AttachmentPicker } from './AttachmentPicker';

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

interface IdeaComposerProps {
  disabled: boolean;
  disabledReason?: string;
  saving: boolean;
  onCreate: (idea: Idea, files: File[]) => Promise<void>;
}

function attachmentFromFile(file: File): DraftAttachment {
  return {
    key: `${file.name}:${file.size}:${file.lastModified}:${crypto.randomUUID()}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

function parseTags(value: string): string[] {
  return [...new Set(value.split(',').map((tag) => tag.trim()).filter(Boolean))];
}

export function IdeaComposer({ disabled, disabledReason, saving, onCreate }: IdeaComposerProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<DraftAttachment[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [status, setStatus] = useState<IdeaStatus>('seed');
  const [pinned, setPinned] = useState(false);
  const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
  const [draftReady, setDraftReady] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(
    () => () => {
      attachmentsRef.current.forEach((attachment) => URL.revokeObjectURL(attachment.previewUrl));
    },
    []
  );

  useEffect(() => {
    let active = true;
    void getCachedComposerDraft().then((cached) => {
      if (!active || !cached) {
        setDraftReady(true);
        return;
      }
      setTitle(cached.title);
      setBody(cached.body);
      setTagsText(cached.tags.join(', '));
      setStatus(cached.status);
      setPinned(cached.pinned);
      setAttachments(cached.attachments.map(({ file }) => attachmentFromFile(file)));
      setDraftReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!disabled) {
      titleRef.current?.focus();
    }
  }, [disabled]);

  useEffect(() => {
    if (!draftReady) return;
    const timeout = window.setTimeout(() => {
      const draft: CachedComposerDraft = {
        title,
        body,
        tags: parseTags(tagsText),
        status,
        pinned,
        attachments: attachments.map(({ key, file }) => ({ key, file })),
        savedAt: new Date().toISOString(),
      };
      void cacheComposerDraft(draft);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [attachments, body, draftReady, pinned, status, tagsText, title]);

  const addFiles = useCallback((files: File[]) => {
    const validFiles = files.filter((file) => file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE);
    if (validFiles.length !== files.length) {
      setLocalError('이미지 파일만 첨부할 수 있고, 파일 하나는 15MB 이하여야 합니다.');
    } else {
      setLocalError(null);
    }
    setAttachments((current) => [...current, ...validFiles.map(attachmentFromFile)]);
  }, []);

  const removeAttachment = (key: string) => {
    setAttachments((current) => {
      const removed = current.find((attachment) => attachment.key === key);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((attachment) => attachment.key !== key);
    });
  };

  const handlePaste = (event: ClipboardEvent<HTMLFormElement>) => {
    const images = [...event.clipboardData.files].filter((file) => file.type.startsWith('image/'));
    if (images.length) {
      event.preventDefault();
      addFiles(images);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || saving) return;

    if (!title.trim() && !body.trim()) {
      setLocalError('제목이나 본문 중 하나는 적어주세요.');
      return;
    }

    const now = new Date().toISOString();
    const idea: Idea = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      title: resolveIdeaTitle(title, body),
      body: body.trim(),
      tags: parseTags(tagsText),
      status,
      pinned,
      imageIds: [],
      optimisticImages: attachments.map((attachment) => ({
        key: attachment.key,
        name: attachment.file.name,
        url: attachment.previewUrl,
      })),
    };

    setLocalError(null);
    try {
      await onCreate(
        idea,
        attachments.map((attachment) => attachment.file)
      );
      attachments.forEach((attachment) => URL.revokeObjectURL(attachment.previewUrl));
      setTitle('');
      setBody('');
      setTagsText('');
      setStatus('seed');
      setPinned(false);
      setAttachments([]);
      await clearComposerDraft();
      titleRef.current?.focus();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : '아이디어를 저장하지 못했습니다.');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  };

  return (
    <section className="composer-wrap" aria-labelledby="composer-heading">
      <form className="idea-composer paper-piece" onSubmit={handleSubmit} onKeyDown={handleKeyDown} onPaste={handlePaste}>
        <div className="composer-copy">
          <h2 id="composer-heading" className="sr-only">
            새 아이디어 작성
          </h2>
          <input
            ref={titleRef}
            className="composer-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목은 나중에 붙여도 돼요"
            aria-label="아이디어 제목"
            disabled={disabled || saving}
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="생각을 붙여두세요…"
            aria-label="아이디어 본문"
            rows={4}
            disabled={disabled || saving}
          />
        </div>
        <AttachmentPicker
          attachments={attachments}
          onAddFiles={addFiles}
          onRemove={removeAttachment}
          disabled={disabled || saving}
        />
        <div className="composer-controls">
          <label className="field field--tags">
            <span>태그</span>
            <input
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              placeholder="앱, 글쓰기, 주말"
              disabled={disabled || saving}
            />
          </label>
          <label className="field">
            <span>상태</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as IdeaStatus)} disabled={disabled || saving}>
              <option value="seed">씨앗</option>
              <option value="growing">키우는 중</option>
              <option value="done">완료</option>
            </select>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} disabled={disabled || saving} />
            <span>위에 붙여두기</span>
          </label>
          <button type="submit" className="button button--accent composer-save" disabled={disabled || saving}>
            {saving ? '붙이는 중…' : '아이디어 붙이기'}
          </button>
          <span className="keyboard-hint">Cmd/Ctrl + Enter</span>
        </div>
        {disabledReason ? <p className="composer-disabled-note">{disabledReason}</p> : null}
        {localError ? <p className="field-error" role="alert">{localError}</p> : null}
      </form>
    </section>
  );
}
