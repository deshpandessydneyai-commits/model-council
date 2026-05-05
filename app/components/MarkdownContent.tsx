export function MarkdownContent({ content }: { content: string }) {
  // Simple markdown parser for the most common cases
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let codeBlock = false;
    let codeContent = "";
    let listItems: string[] = [];

    const flushCodeBlock = (key: string) => {
      if (codeContent) {
        elements.push(
          <pre
            key={key}
            className="bg-[#1A1A2E] border border-glass rounded px-3 py-2 overflow-x-auto text-xs font-mono my-2"
          >
            <code className="text-gray-300">{codeContent}</code>
          </pre>
        );
        codeContent = "";
      }
    };

    const flushListItems = (key: string) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key} className="list-disc list-inside my-2 space-y-1 text-sm">
            {listItems.map((item, i) => (
              <li key={i} className="text-gray-300">
                {item.replace(/^[-*]\s+/, "")}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, i) => {
      // Code blocks
      if (line.startsWith("```")) {
        if (codeBlock) {
          flushCodeBlock(`code-${i}`);
          codeBlock = false;
        } else {
          flushListItems(`list-before-${i}`);
          codeBlock = true;
        }
        return;
      }

      if (codeBlock) {
        codeContent += (codeContent ? "\n" : "") + line;
        return;
      }

      // Headers
      if (line.startsWith("### ")) {
        flushListItems(`list-before-h3-${i}`);
        elements.push(
          <h3 key={`h3-${i}`} className="text-sm font-bold text-white mt-3 mb-2">
            {line.replace(/^### /, "")}
          </h3>
        );
        return;
      }

      if (line.startsWith("## ")) {
        flushListItems(`list-before-h2-${i}`);
        elements.push(
          <h2 key={`h2-${i}`} className="text-base font-bold text-white mt-4 mb-2">
            {line.replace(/^## /, "")}
          </h2>
        );
        return;
      }

      if (line.startsWith("# ")) {
        flushListItems(`list-before-h1-${i}`);
        elements.push(
          <h1 key={`h1-${i}`} className="text-lg font-bold text-white mt-4 mb-2">
            {line.replace(/^# /, "")}
          </h1>
        );
        return;
      }

      // List items
      if (line.match(/^[-*]\s+/)) {
        listItems.push(line);
        return;
      }

      // Empty lines
      if (line.trim() === "") {
        flushListItems(`list-${i}`);
        if (elements.length > 0 && elements[elements.length - 1] !== "\n") {
          elements.push(<div key={`space-${i}`} className="h-2" />);
        }
        return;
      }

      // Regular paragraphs with inline formatting
      flushListItems(`list-before-p-${i}`);
      const formattedLine = formatInlineMarkdown(line);
      elements.push(
        <p key={`p-${i}`} className="text-sm leading-relaxed text-gray-300 mb-2">
          {formattedLine}
        </p>
      );
    });

    flushCodeBlock("code-end");
    flushListItems("list-end");

    return elements;
  };

  const formatInlineMarkdown = (text: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Bold
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;

    const processText = (str: string) => {
      const elements: React.ReactNode[] = [];
      let lastIdx = 0;
      let boldMatch;

      while ((boldMatch = boldRegex.exec(str)) !== null) {
        if (boldMatch.index > lastIdx) {
          elements.push(str.substring(lastIdx, boldMatch.index));
        }
        elements.push(
          <strong key={boldMatch.index} className="font-bold text-white">
            {boldMatch[1]}
          </strong>
        );
        lastIdx = boldMatch.index + boldMatch[0].length;
      }

      if (lastIdx < str.length) {
        elements.push(str.substring(lastIdx));
      }

      return elements;
    };

    return processText(text);
  };

  return (
    <div className="prose-sm prose-invert max-w-none">
      {parseMarkdown(content)}
    </div>
  );
}
