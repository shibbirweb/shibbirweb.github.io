import fs from 'node:fs';
import path from 'node:path';

// Shared by the content checks: finding the files that make up the site's prose
// and splitting their bodies into fenced code blocks and ordinary lines.

export const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');
export const WIKI_DIRECTORY = path.join(process.cwd(), 'docs/wiki');

export interface MarkdownFence {
    /** The info string's first word, e.g. `mermaid` or `reactflow`. */
    language: string;
    /** The text between the opening and closing fence lines. */
    body: string;
    /** 1-based line number of the opening fence. */
    lineNumber: number;
}

export interface ScannedMarkdown {
    fences: MarkdownFence[];
    /** Lines outside every fence, with their 1-based line numbers. */
    proseLines: { text: string; lineNumber: number }[];
}

const FENCE_OPENING = /^\s{0,3}(`{3,}|~{3,})\s*([^\s`]*)/;

/**
 * Splits markdown into fences and prose. A fence closes on a line made only of
 * the same fence character, at least as long as the opener, which is the rule
 * marked (and CommonMark) apply.
 */
export function scanMarkdown(markdown: string): ScannedMarkdown {
    const fences: MarkdownFence[] = [];
    const proseLines: ScannedMarkdown['proseLines'] = [];
    const lines = markdown.split('\n');
    let openFence: {
        marker: string;
        language: string;
        lineNumber: number;
        body: string[];
    } | null = null;

    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        if (openFence) {
            const closing = line.trim();
            const isClosing =
                closing.length >= openFence.marker.length &&
                closing === openFence.marker[0].repeat(closing.length);
            if (isClosing) {
                fences.push({
                    language: openFence.language,
                    body: openFence.body.join('\n'),
                    lineNumber: openFence.lineNumber,
                });
                openFence = null;
                return;
            }
            openFence.body.push(line);
            return;
        }
        const opening = line.match(FENCE_OPENING);
        if (opening) {
            openFence = {
                marker: opening[1],
                language: opening[2].toLowerCase(),
                lineNumber,
                body: [],
            };
            return;
        }
        proseLines.push({ text: line, lineNumber });
    });

    return { fences, proseLines };
}

/** Markdown file names in a directory, sorted. */
export function markdownFilesIn(directory: string): string[] {
    return fs
        .readdirSync(directory)
        .filter((name) => /\.mdx?$/.test(name))
        .sort();
}

export function readText(directory: string, name: string): string {
    return fs.readFileSync(path.join(directory, name), 'utf8');
}
