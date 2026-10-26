import { marked } from "marked";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractTocAndParseMarkdown(markdownText: string): {
  html: string;
  toc: TocItem[];
} {
  const toc: TocItem[] = [];

  // Custom renderer for marked
  const renderer = new marked.Renderer();

  renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
    // Generate clean slug for heading anchor
    const cleanText = text.replace(/<[^>]*>/g, "");
    const id = cleanText
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\-_]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (depth === 2 || depth === 3) {
      toc.push({ id, text: cleanText, level: depth });
    }

    return `<h${depth} id="${id}" class="scroll-mt-24 group flex items-center gap-2">
      <span>${text}</span>
      <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-cyan-500 text-sm transition-opacity no-underline" aria-label="Link to this section">#</a>
    </h${depth}>`;
  };

  renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
    const language = lang || "plaintext";
    const escapedCode = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    return `<div class="code-block my-6 rounded-2xl overflow-hidden border theme-border theme-surface">
      <div class="flex items-center justify-between px-4 py-2 border-b theme-border text-xs font-mono theme-text-secondary">
        <span class="text-cyan-500 font-bold">${language}</span>
        <button class="copy-btn hover:text-cyan-400 cursor-pointer transition-colors" data-code="${encodeURIComponent(
          text
        )}">
          Copy
        </button>
      </div>
      <pre class="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed"><code class="language-${language}">${escapedCode}</code></pre>
    </div>`;
  };

  const rawHtml = marked.parse(markdownText, {
    renderer,
    gfm: true,
    breaks: true,
  }) as string;

  return { html: rawHtml, toc };
}
