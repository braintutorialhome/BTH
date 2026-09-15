import React from 'react';

interface FormattedNoticeContentProps {
  content: string;
  className?: string;
  paragraphClassName?: string;
}

// Render bold tokens (**bold** or __bold__) safely
function renderFormattedInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  return parts.map((part, i) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Arranges text paragraphs faithfully as provided:
 * - Preserves double-newline paragraph separation with clean vertical rhythm
 * - Preserves exact internal linebreaks and indentation via whitespace-pre-wrap
 * - Gracefully formats bulleted and numbered lists if provided
 * - Supports bold emphasis via markdown style **text**
 */
export const FormattedNoticeContent: React.FC<FormattedNoticeContentProps> = ({
  content,
  className = 'text-slate-300 text-base md:text-lg leading-relaxed font-normal',
  paragraphClassName = 'whitespace-pre-wrap break-words leading-relaxed'
}) => {
  if (!content) return null;

  // Split content by 2 or more consecutive newlines into distinct logical paragraphs
  const rawParagraphs = content.split(/\n{2,}/);

  return (
    <div className={`space-y-4 select-text ${className}`}>
      {rawParagraphs.map((paragraph, pIdx) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        // Check if this paragraph is composed of bulleted or numbered lines
        const lines = paragraph.split('\n');
        const hasListItems = lines.length > 1 && lines.every(line => {
          const t = line.trim();
          return !t || /^[•\-\*✓👉➢▪]\s+/.test(t) || /^\d+[\.\)]\s+/.test(t);
        });

        if (hasListItems) {
          return (
            <ul key={pIdx} className="space-y-2 pl-2 my-2">
              {lines.map((line, lIdx) => {
                const clean = line.trim();
                if (!clean) return null;
                const match = clean.match(/^([•\-\*✓👉➢▪]|\d+[\.\)])\s+(.*)$/);
                if (match) {
                  return (
                    <li key={lIdx} className="flex items-start gap-3">
                      <span className="text-cyan-400 font-bold shrink-0 mt-0.5 select-none text-sm md:text-base">
                        {match[1]}
                      </span>
                      <span className="whitespace-pre-wrap break-words flex-1">
                        {renderFormattedInline(match[2])}
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={lIdx} className="whitespace-pre-wrap break-words pl-4">
                    {renderFormattedInline(clean)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard text paragraph preserving internal single newlines and spacing
        return (
          <p key={pIdx} className={paragraphClassName}>
            {renderFormattedInline(paragraph)}
          </p>
        );
      })}
    </div>
  );
};

export default FormattedNoticeContent;
