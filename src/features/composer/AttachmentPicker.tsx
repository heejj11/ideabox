import { useRef, type DragEvent } from 'react';
import type { DraftAttachment } from '../../types/idea';

interface AttachmentPickerProps {
  attachments: DraftAttachment[];
  onAddFiles: (files: File[]) => void;
  onRemove: (key: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function AttachmentPicker({
  attachments,
  onAddFiles,
  onRemove,
  disabled = false,
  compact = false,
}: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      onAddFiles([...event.dataTransfer.files]);
    }
  };

  return (
    <div className={`attachment-picker ${compact ? 'attachment-picker--compact' : ''}`}>
      <div
        className="attachment-picker__dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        data-disabled={disabled}
      >
        <strong>이미지 붙이기</strong>
        <span>드래그, 붙여넣기 또는 파일 선택</span>
        <button type="button" className="button button--small" onClick={() => inputRef.current?.click()} disabled={disabled}>
          파일 선택
        </button>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/*"
          multiple
          disabled={disabled}
          onChange={(event) => {
            onAddFiles([...(event.target.files ?? [])]);
            event.target.value = '';
          }}
        />
      </div>
      {attachments.length ? (
        <ul className="attachment-preview-list" aria-label="첨부할 이미지">
          {attachments.map((attachment) => (
            <li key={attachment.key}>
              <img src={attachment.previewUrl} alt={attachment.file.name} />
              <button type="button" onClick={() => onRemove(attachment.key)} aria-label={`${attachment.file.name} 제거`}>
                제거
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
