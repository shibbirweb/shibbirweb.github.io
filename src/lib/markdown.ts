import {
    marked,
    type Tokens,
    type TokenizerAndRendererExtension,
} from 'marked';
import { codeToHtml } from 'shiki';

/** A heading in the article body, used to build the table of contents. */
export interface TocItem {
    id: string;
    text: string;
    /** Heading level: 2 for `##`, 3 for `###`. */
    level: number;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// A standalone GitHub gist URL on its own line becomes an embedded gist,
// fetched and inlined at build time by renderGist below.
const GIST_PATTERN =
    /^(https:\/\/gist\.github\.com\/[\w.-]+\/[0-9a-f]+)(?:\.js)?[ \t]*(?:\n+|$)/;

type GistToken = Tokens.Generic & { url?: string; html?: string };

/** A plain link to the gist, used when the embed markup is unavailable. */
function gistFallback(url: string): string {
    return (
        `<p class="gist-embed gist-embed--fallback">` +
        `<a href="${url}" target="_blank" rel="noopener noreferrer">` +
        `View this gist on GitHub</a></p>`
    );
}

// GitHub serves an embeddable HTML fragment plus a stylesheet for each gist via
// its .json endpoint. We fetch and inline both at build time, so the gist is
// fully styled in the static HTML with no iframe and no client JS. If the fetch
// fails (offline build, deleted gist) we fall back to a link, never the build.
async function renderGist(url: string): Promise<string> {
    // In the browser (the editor's live preview) the gist .json endpoint has no
    // CORS headers, so skip the fetch and show a link. The server render (build,
    // full-page preview) still inlines the styled embed.
    if (typeof window !== 'undefined') return gistFallback(url);
    try {
        const response = await fetch(`${url}.json`);
        if (!response.ok) throw new Error(`gist responded ${response.status}`);
        const data = (await response.json()) as {
            div?: string;
            stylesheet?: string;
        };
        if (!data.div) throw new Error('gist response missing markup');
        let stylesheet = data.stylesheet ?? '';
        if (stylesheet.startsWith('//')) stylesheet = `https:${stylesheet}`;
        const link = stylesheet
            ? `<link rel="stylesheet" href="${stylesheet}" />`
            : '';
        return (
            `<div class="not-prose gist-embed" data-color-mode="light" ` +
            `data-light-theme="light">${link}${data.div}</div>`
        );
    } catch {
        return gistFallback(url);
    }
}

const gistExtension: TokenizerAndRendererExtension = {
    name: 'gist',
    level: 'block',
    start(src) {
        const index = src.indexOf('https://gist.github.com/');
        return index < 0 ? undefined : index;
    },
    tokenizer(src) {
        const match = GIST_PATTERN.exec(src);
        if (!match) return undefined;
        return { type: 'gist', raw: match[0], url: match[1] };
    },
    renderer(token) {
        const gistToken = token as GistToken;
        return typeof gistToken.html === 'string' ? gistToken.html : '';
    },
};

// Build-time syntax highlighting with two themes; globals.css picks the dark
// palette under prefers-color-scheme so code matches the site theme.
type CodeToken = Tokens.Code & { highlighted?: string };
const CODE_THEMES = { light: 'github-light', dark: 'github-dark' } as const;

interface CodeMeta {
    lang: string;
    filePath?: string;
}

/**
 * Parses a fenced block's info string into a language plus an optional file path
 * (where the snippet belongs). Supports `lang path/to/file.ext` and
 * `lang title="path/to/file.ext"`.
 */
function parseCodeMeta(token: CodeToken): CodeMeta {
    const info = (token.lang ?? '').trim();
    if (!info) return { lang: 'text' };
    const [lang, ...rest] = info.split(/\s+/);
    const titled = info.match(/title="([^"]+)"/);
    const remainder = rest.join(' ').trim();
    const filePath = titled
        ? titled[1]
        : remainder && !remainder.includes('=')
          ? remainder
          : undefined;
    return { lang: lang || 'text', filePath };
}

/** Header label: the file extension when a path is given, else the language. */
function codeLabel(lang: string, filePath?: string): string {
    if (!filePath) return lang;
    const name = filePath.split('/').pop() ?? filePath;
    const dot = name.lastIndexOf('.');
    return dot > 0 ? name.slice(dot + 1) : lang;
}

/**
 * Wraps highlighted code in a header (language/extension badge + optional file
 * path) with a copy-button slot the client fills in (see CodeBlock).
 */
function renderCodeBlock(
    highlighted: string,
    lang: string,
    filePath?: string
): string {
    const pathHtml = filePath
        ? `<span class="code-block__path">${escapeHtml(filePath)}</span>`
        : '';
    return (
        `<figure class="code-block not-prose">` +
        `<figcaption class="code-block__bar">` +
        `<span class="code-block__meta">` +
        `<span class="code-block__lang">${escapeHtml(codeLabel(lang, filePath))}</span>` +
        pathHtml +
        `</span>` +
        `<span class="code-block__copy" data-code-copy></span>` +
        `</figcaption>` +
        highlighted +
        `</figure>`
    );
}

async function highlightCode(code: string, lang: string): Promise<string> {
    try {
        return await codeToHtml(code, {
            lang,
            themes: CODE_THEMES,
            defaultColor: false,
        });
    } catch {
        return await codeToHtml(code, {
            lang: 'text',
            themes: CODE_THEMES,
            defaultColor: false,
        });
    }
}

marked.use({
    async: true,
    extensions: [gistExtension],
    async walkTokens(token) {
        if (token.type === 'code') {
            const codeToken = token as CodeToken;
            const { lang } = parseCodeMeta(codeToken);
            // Mermaid blocks render to SVG in the browser (see MermaidRenderer),
            // so skip Shiki and let the code renderer emit a <pre class="mermaid">.
            if (lang === 'mermaid') return;
            codeToken.highlighted = await highlightCode(codeToken.text, lang);
        }
        if (token.type === 'gist') {
            const gistToken = token as GistToken;
            if (typeof gistToken.url === 'string') {
                gistToken.html = await renderGist(gistToken.url);
            }
        }
    },
    renderer: {
        code(token) {
            const codeToken = token as CodeToken;
            const { lang, filePath } = parseCodeMeta(codeToken);
            if (lang === 'mermaid') {
                return `<pre class="mermaid not-prose">${escapeHtml(
                    codeToken.text
                )}</pre>`;
            }
            const highlighted =
                codeToken.highlighted ??
                `<pre><code>${escapeHtml(codeToken.text)}</code></pre>`;
            return renderCodeBlock(highlighted, lang, filePath);
        },
    },
});

/** Turn heading text into a URL-safe anchor slug (`Cache-aside` -> `cache-aside`). */
export function slugifyHeading(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const HTML_ENTITIES: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
};

/** Strip inline tags and decode the few entities `marked` emits, for plain text. */
function headingPlainText(inner: string): string {
    return (
        inner
            .replace(/<[^>]+>/g, '')
            .replace(
                /&amp;|&lt;|&gt;|&quot;|&#39;/g,
                (entity) => HTML_ENTITIES[entity]
            )
            // Drop any other entity (e.g. &hellip;, &#8230;) so it never leaks a
            // literal "hellip" into the slug; the visible heading keeps its glyph.
            .replace(/&#?[a-z0-9]+;/gi, '')
            .trim()
    );
}

/**
 * Adds stable `id` anchors to the body's H2/H3 headings and returns the table of
 * contents alongside the rewritten HTML. IDs and the TOC are produced in a single
 * pass so they always agree; duplicate slugs are disambiguated with a numeric
 * suffix (`-2`, `-3`). Headings that already carry an id are left untouched.
 */
function addHeadingIdsAndExtractToc(html: string): {
    html: string;
    toc: TocItem[];
} {
    const toc: TocItem[] = [];
    const used = new Map<string, number>();
    const rewritten = html.replace(
        /<h([23])>([\s\S]*?)<\/h\1>/g,
        (match, level: string, inner: string) => {
            const text = headingPlainText(inner);
            if (!text) return match;
            const base = slugifyHeading(text) || 'section';
            const seen = used.get(base) ?? 0;
            used.set(base, seen + 1);
            const id = seen === 0 ? base : `${base}-${seen + 1}`;
            toc.push({ id, text, level: Number(level) });
            return `<h${level} id="${id}">${inner}</h${level}>`;
        }
    );
    return { html: rewritten, toc };
}

/**
 * Render Markdown through the same Shiki, gist, Mermaid, and heading pipeline
 * used by production article pages.
 */
export async function renderMarkdown(content: string): Promise<{
    html: string;
    toc: TocItem[];
}> {
    const rendered = await marked.parse(content);
    return addHeadingIdsAndExtractToc(rendered);
}
