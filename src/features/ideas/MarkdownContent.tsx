import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  children: string;
  compact?: boolean;
}

export function MarkdownContent({ children, compact = false }: MarkdownContentProps) {
  return (
    <div className={`markdown-content ${compact ? 'markdown-content--compact' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children: linkChildren, href }) => (
            <a href={href} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
              {linkChildren}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
