import { Marked, type Tokens, type TokenizerAndRendererExtension } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import styles from '@/components/admin/Editor/VisualEditor/VisualEditor.module.css';

/**
 * The Markdown <-> HTML bridge for the WYSIWYG Visual editor.
 *
 * The editable surface is rendered HTML (so the writer sees formatted content,
 * not raw syntax), but Markdown stays the single source of truth. Prose blocks
 * round-trip through marked (render) and turndown (serialize). The fragile,
 * easy-to-mangle blocks (code, Mermaid, gists) are rendered as ATOMIC widgets
 * that carry their exact source Markdown in `data-md`, so they serialize back
 * verbatim and can never be corrupted by an edit or a round-trip.
 */

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Split a fenced block's info string into a language and optional file path. */
export function parseCodeInfo(info: string): { lang: string; filePath?: string } {
    const trimmed = (info ?? '').trim();
    if (!trimmed) return { lang: 'text' };
    const [lang, ...rest] = trimmed.split(/\s+/);
    const titled = trimmed.match(/title="([^"]+)"/);
    const remainder = rest.join(' ').trim();
    const filePath = titled
        ? titled[1]
        : remainder && !remainder.includes('=')
          ? remainder
          : undefined;
    return { lang: lang || 'text', filePath };
}

/** Build an atomic, non-editable widget that preserves its source Markdown. */
function embedWidget(
    sourceMarkdown: string,
    kind: 'code' | 'mermaid' | 'gist',
    label: string,
    body: string
): string {
    const encoded = encodeURIComponent(sourceMarkdown);
    return (
        `<div class="${styles.embed}" data-md="${encoded}" data-kind="${kind}" ` +
        `contenteditable="false" title="Click to edit">` +
        `<span data-role="label">${escapeHtml(label)}</span>` +
        `<div data-role="body">${body}</div>` +
        `</div>`
    );
}

const GIST_LINE =
    /^(https:\/\/gist\.github\.com\/[\w.-]+\/[0-9a-f]+)(?:\.js)?[ \t]*$/;

const gistExtension: TokenizerAndRendererExtension = {
    name: 'gistEmbed',
    level: 'block',
    start(src) {
        const index = src.indexOf('https://gist.github.com/');
        return index < 0 ? undefined : index;
    },
    tokenizer(src) {
        const line = src.split('\n', 1)[0];
        const match = GIST_LINE.exec(line);
        if (!match) return undefined;
        return { type: 'gistEmbed', raw: match[0], url: match[1] } as Tokens.Generic;
    },
    renderer(token) {
        const url = (token as Tokens.Generic).url as string;
        return embedWidget(url, 'gist', 'GitHub gist', escapeHtml(url));
    },
};

const renderMarked = new Marked({ gfm: true, breaks: false });
renderMarked.use({
    extensions: [gistExtension],
    renderer: {
        code(token) {
            const { lang, filePath } = parseCodeInfo(token.lang ?? '');
            const source =
                '```' + (token.lang ?? '').trim() + '\n' + token.text + '\n```';
            if (lang === 'mermaid') {
                return embedWidget(
                    source,
                    'mermaid',
                    'Mermaid diagram',
                    `<pre>${escapeHtml(token.text)}</pre>`
                );
            }
            const label = filePath ? `${lang} · ${filePath}` : lang;
            return embedWidget(
                source,
                'code',
                label,
                `<pre>${escapeHtml(token.text)}</pre>`
            );
        },
    },
});

/** Render article-body Markdown to the HTML shown in the editable surface. */
export function markdownToHtml(markdown: string): string {
    return renderMarked.parse(markdown, { async: false }) as string;
}

let turndown: TurndownService | null = null;

function getTurndown(): TurndownService {
    if (turndown) return turndown;
    const service = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        emDelimiter: '_',
        strongDelimiter: '**',
        linkStyle: 'inlined',
    });
    service.use(gfm);
    // Highlight, underline, and details/summary have no Markdown equivalent in
    // this pipeline; keep them as the raw HTML the production renderer accepts.
    service.keep(['mark', 'u', 'details', 'summary']);
    // A plain image becomes clean `![alt](src)`, but an image carrying a style
    // (alignment / width) is kept as HTML so that styling survives the round-trip.
    service.addRule('styledImage', {
        filter: (node) =>
            node.nodeName === 'IMG' &&
            Boolean((node as HTMLElement).getAttribute('style')),
        replacement: (_content, node) => (node as HTMLElement).outerHTML,
    });
    // Atomic widgets serialize back to their stored source verbatim.
    service.addRule('mdEmbed', {
        filter: (node) =>
            node.nodeType === 1 &&
            (node as HTMLElement).hasAttribute('data-md'),
        replacement: (_content, node) =>
            '\n\n' +
            decodeURIComponent(
                (node as HTMLElement).getAttribute('data-md') ?? ''
            ) +
            '\n\n',
    });
    turndown = service;
    return service;
}

/** Serialize the editable surface's HTML back to clean Markdown. */
export function htmlToMarkdown(html: string): string {
    return (
        getTurndown()
            .turndown(html)
            // Tighten turndown's loose list-marker spacing ("-   " -> "- ").
            .replace(/^(\s*)([-*+])[ \t]{2,}/gm, '$1$2 ')
            .replace(/^(\s*\d+\.)[ \t]{2,}/gm, '$1 ')
            .replace(/\n{3,}/g, '\n\n')
            .trim() + '\n'
    );
}

/** Render a Markdown snippet to a detached HTML fragment for insertion. */
export function fragmentFromMarkdown(markdown: string): DocumentFragment {
    const template = document.createElement('template');
    template.innerHTML = markdownToHtml(markdown);
    return template.content;
}

/** Render an inline Markdown snippet, stripping the wrapping block paragraph. */
export function inlineFragmentFromMarkdown(markdown: string): DocumentFragment {
    const template = document.createElement('template');
    template.innerHTML = markdownToHtml(markdown)
        .replace(/^\s*<p>/, '')
        .replace(/<\/p>\s*$/, '');
    return template.content;
}
