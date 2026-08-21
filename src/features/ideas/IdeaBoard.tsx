import type { Idea } from '../../types/idea';
import { IdeaCard } from './IdeaCard';

interface IdeaBoardProps {
  ideas: Idea[];
  readOnly: boolean;
  organizedMode: boolean;
  onOpen: (ideaId: string) => void;
  onTogglePin: (idea: Idea) => void;
}

export function IdeaBoard({ ideas, readOnly, organizedMode, onOpen, onTogglePin }: IdeaBoardProps) {
  if (!ideas.length) {
    return (
      <section className="empty-state paper-piece">
        <strong>아직 붙여둔 생각이 없어요.</strong>
        <p>위 입력창에 한 줄만 적어도 첫 아이디어 조각이 생깁니다.</p>
      </section>
    );
  }

  return (
    <section className={`idea-board ${organizedMode ? 'idea-board--organized' : ''}`} aria-label="아이디어 목록">
      {ideas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          readOnly={readOnly}
          onOpen={() => onOpen(idea.id)}
          onTogglePin={() => onTogglePin(idea)}
        />
      ))}
    </section>
  );
}
