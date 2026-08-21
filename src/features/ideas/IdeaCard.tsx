import type { CSSProperties } from 'react';
import { IDEA_STATUS_LABELS, type Idea } from '../../types/idea';
import {
  getCardRotation,
  getStickerRotation,
  getStickerVariant,
  getTapeOffset,
  getTapeRotation,
} from '../../lib/utils/deterministicStyle';
import { IdeaImage } from './IdeaImage';
import { MarkdownContent } from './MarkdownContent';

type CardStyle = CSSProperties & {
  '--card-rotation': string;
  '--tape-rotation': string;
  '--tape-left': string;
};

interface IdeaCardProps {
  idea: Idea;
  readOnly: boolean;
  onOpen: () => void;
  onTogglePin: () => void;
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function IdeaCard({ idea, readOnly, onOpen, onTogglePin }: IdeaCardProps) {
  const style: CardStyle = {
    '--card-rotation': `${getCardRotation(idea.id)}deg`,
    '--tape-rotation': `${getTapeRotation(idea.id)}deg`,
    '--tape-left': `${getTapeOffset(idea.id)}%`,
  };

  return (
    <article
      className={`idea-card paper-piece status-${idea.status}`}
      style={style}
      onClick={onOpen}
    >
      <button
        type="button"
        className={`pin-sticker ${idea.pinned ? 'pin-sticker--active' : ''}`}
        aria-label={idea.pinned ? '상단 고정 해제' : '상단에 고정'}
        aria-pressed={idea.pinned}
        disabled={readOnly}
        onClick={(event) => {
          event.stopPropagation();
          onTogglePin();
        }}
      >
        <span className="pin-sticker__shape" aria-hidden="true" />
        <span className="sr-only">{idea.pinned ? '고정됨' : '고정 안 됨'}</span>
      </button>
      {idea.optimisticImages?.length || idea.imageIds.length ? (
        <div className="card-images">
          {idea.optimisticImages?.map((image) => <img key={image.key} src={image.url} alt={image.name} />)}
          {idea.imageIds.slice(0, 2).map((fileId, index) => (
            <IdeaImage key={fileId} fileId={fileId} alt={`${idea.title} 첨부 이미지 ${index + 1}`} />
          ))}
        </div>
      ) : null}
      <div className="idea-card__heading">
        <h2>
          <button
            type="button"
            className="idea-card__open"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
          >
            {idea.title}
          </button>
        </h2>
        <span className="status-label">{IDEA_STATUS_LABELS[idea.status]}</span>
      </div>
      {idea.body ? <MarkdownContent compact>{idea.body}</MarkdownContent> : <p className="empty-body">본문이 아직 없어요.</p>}
      {idea.tags.length ? (
        <ul className="tag-list" aria-label="태그">
          {idea.tags.map((tag) => (
            <li
              key={tag}
              className={`tag-sticker tag-sticker--${getStickerVariant(tag)}`}
              style={{ transform: `rotate(${getStickerRotation(`${idea.id}:${tag}`)}deg)` }}
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      <footer className="idea-card__meta">
        <time dateTime={idea.createdAt}>{dateFormatter.format(new Date(idea.createdAt))}</time>
        {idea.syncState === 'pending' ? <span>저장 중</span> : null}
        {idea.syncState === 'failed' ? <span className="sync-error">저장 실패</span> : null}
        {idea.syncState === 'cleanup-pending' ? <span className="sync-error">이미지 정리 대기</span> : null}
      </footer>
    </article>
  );
}
