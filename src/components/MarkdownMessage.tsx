import React from 'react';

interface MarkdownMessageProps {
  content: string;
  isStreaming?: boolean;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, isStreaming }) => {
  // Parse paragraphs and blocks
  const parseMarkdown = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = () => {
      if (currentList) {
        if (currentList.type === 'ul') {
          elements.push(
            <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5 pl-4 list-disc marker:text-amber-400">
              {currentList.items.map((item, i) => (
                <li key={i} className="text-slate-200 leading-relaxed text-xs sm:text-sm">
                  {formatInline(item)}
                </li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={`ol-${elements.length}`} className="my-2 space-y-1.5 pl-4 list-decimal marker:text-amber-400 font-medium">
              {currentList.items.map((item, i) => (
                <li key={i} className="text-slate-200 leading-relaxed text-xs sm:text-sm">
                  {formatInline(item)}
                </li>
              ))}
            </ol>
          );
        }
        currentList = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check unordered list: * or -
      const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
      if (ulMatch) {
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(ulMatch[1]);
        continue;
      }

      // Check ordered list: 1. or 2.
      const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
      if (olMatch) {
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(olMatch[1]);
        continue;
      }

      // Not in list, flush any active list
      flushList();

      if (!trimmed) {
        // Empty line -> spacing
        continue;
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3
            key={`h3-${i}`}
            className="text-sm sm:text-base font-bold text-amber-300 mt-3.5 mb-1.5 first:mt-0 tracking-wide font-serif"
          >
            {formatInline(trimmed.slice(4))}
          </h3>
        );
        continue;
      }

      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${i}`}
            className="text-base sm:text-lg font-bold text-white mt-4 mb-2 first:mt-0 tracking-wide font-serif border-b border-white/10 pb-1"
          >
            {formatInline(trimmed.slice(3))}
          </h2>
        );
        continue;
      }

      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1
            key={`h1-${i}`}
            className="text-lg sm:text-xl font-bold text-white mt-4 mb-2 first:mt-0 tracking-wide font-serif"
          >
            {formatInline(trimmed.slice(2))}
          </h1>
        );
        continue;
      }

      // Blockquotes
      if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote
            key={`bq-${i}`}
            className="border-l-2 border-amber-500/60 pl-3 py-1 my-2 bg-amber-500/5 text-slate-300 text-xs sm:text-sm rounded-r"
          >
            {formatInline(trimmed.slice(2))}
          </blockquote>
        );
        continue;
      }

      // Regular paragraph
      elements.push(
        <p key={`p-${i}`} className="my-1.5 text-slate-200 leading-relaxed text-xs sm:text-sm">
          {formatInline(trimmed)}
        </p>
      );
    }

    flushList();
    return elements;
  };

  // Inline formatting helper (**bold**, *italic*, `code`, [link])
  const formatInline = (text: string): React.ReactNode => {
    // Process bold (**text**)
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] sm:text-xs border border-slate-700/60"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} className="italic text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className="markdown-body space-y-1">
      {parseMarkdown(content)}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
      )}
    </div>
  );
};
