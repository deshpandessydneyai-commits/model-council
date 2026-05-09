"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2 leading-snug">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-gray-900 dark:text-white mt-4 mb-2 leading-snug">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-3 mb-1.5 leading-snug">{children}</h3>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-3">{children}</p>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 my-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 my-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),

  // Inline
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
  ),

  // Links — open in new tab safely
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 dark:text-violet-400 underline underline-offset-2 hover:text-indigo-800 dark:hover:text-violet-300 transition-colors"
    >
      {children}
    </a>
  ),

  // Code
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="bg-[#EEEDEA] dark:bg-[#1A1A2E] border border-[#E2E0DA] dark:border-glass rounded-lg px-4 py-3 overflow-x-auto text-xs font-mono my-3 scrollbar-theme">
          <code className="text-gray-800 dark:text-gray-300">{children}</code>
        </pre>
      );
    }
    return (
      <code className="bg-[#EEEDEA] dark:bg-[#1A1A2E] text-indigo-700 dark:text-violet-300 px-1.5 py-0.5 rounded text-xs font-mono">
        {children}
      </code>
    );
  },

  // Tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-lg border border-[#E2E0DA] dark:border-glass">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#F0EFEB] dark:bg-[#1A1A2E]">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-[#EEEDEA] dark:hover:bg-white/5 transition-colors">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{children}</td>
  ),

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-indigo-300 dark:border-violet-600 pl-4 my-3 text-gray-600 dark:text-gray-400 italic">
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: () => <hr className="my-4 border-[#E2E0DA] dark:border-gray-700" />,
};

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="max-w-none text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
