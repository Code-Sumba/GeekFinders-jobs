import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/** Markdown → HTML on the server, then sanitised (no scripts, iframes, styles or event handlers). */
export function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false, gfm: true, breaks: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "a", "blockquote", "code", "pre", "br", "hr", "table", "thead", "tbody", "tr", "th", "td"],
    allowedAttributes: { a: ["href", "title", "rel", "target"] },
    allowedSchemes: ["https", "http", "mailto"],
    transformTags: {
      a: (tag, attribs) => {
        const external = /^https?:/i.test(attribs.href ?? "");
        return { tagName: "a", attribs: { ...attribs, ...(external ? { rel: "noopener nofollow ugc", target: "_blank" } : {}) } };
      },
    },
  });
}
