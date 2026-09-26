import { describe, expect, it, vi } from 'vitest';
import { renderMarkdown, slugifyHeading } from '@/lib/markdown';

const GIST_URL = 'https://gist.github.com/shibbirweb/0a1b2c3d4e5f';

/** A minimal fetch Response stand-in for the gist .json endpoint. */
function gistResponse(ok: boolean, body: unknown): Response {
    return {
        ok,
        status: ok ? 200 : 404,
        json: async () => body,
    } as Response;
}

describe('slugifyHeading', () => {
    it('lowercases and joins words with single hyphens', () => {
        expect(slugifyHeading('Cache-aside Pattern')).toBe(
            'cache-aside-pattern'
        );
    });

    it('collapses runs of punctuation and trims leading/trailing hyphens', () => {
        expect(slugifyHeading('  What is `firstOrCreate()`?!  ')).toBe(
            'what-is-firstorcreate'
        );
    });

    it('returns an empty string when nothing slug-worthy remains', () => {
        expect(slugifyHeading('!!!')).toBe('');
    });
});

describe('renderMarkdown headings and table of contents', () => {
    it('adds slug ids to h2/h3 headings and lists them in the TOC', async () => {
        const { html, toc } = await renderMarkdown(
            '## Getting started\n\n### Sub & more'
        );

        expect(html).toContain('<h2 id="getting-started">Getting started</h2>');
        expect(html).toContain('<h3 id="sub-more">Sub &amp; more</h3>');
        expect(toc).toEqual([
            { id: 'getting-started', text: 'Getting started', level: 2 },
            { id: 'sub-more', text: 'Sub & more', level: 3 },
        ]);
    });

    it('leaves h1 and h4+ headings out of the TOC and without ids', async () => {
        const { html, toc } = await renderMarkdown('# Top\n\n#### Deep');

        expect(html).toContain('<h1>Top</h1>');
        expect(html).toContain('<h4>Deep</h4>');
        expect(toc).toEqual([]);
    });

    it('disambiguates duplicate headings with -2 and -3 suffixes', async () => {
        const { toc } = await renderMarkdown(
            '## Setup\n\n## Setup\n\n## Setup'
        );

        expect(toc.map((item) => item.id)).toEqual([
            'setup',
            'setup-2',
            'setup-3',
        ]);
    });

    it('uses an explicit {#custom-id} and strips it from the visible text', async () => {
        const { html, toc } = await renderMarkdown('## Custom anchor {#my-id}');

        expect(html).toContain('<h2 id="my-id">Custom anchor</h2>');
        expect(html).not.toContain('{#my-id}');
        expect(toc).toEqual([{ id: 'my-id', text: 'Custom anchor', level: 2 }]);
    });

    it('never emits the same id twice when an explicit id collides with a slug', async () => {
        const { toc } = await renderMarkdown('## Setup\n\n## Other {#setup}');

        expect(toc.map((item) => item.id)).toEqual(['setup', 'setup-2']);
    });

    it('uses plain text for the TOC label when the heading has inline markup', async () => {
        const { html, toc } = await renderMarkdown(
            '## Using `firstOrCreate()` safely'
        );

        expect(html).toContain('<code>firstOrCreate()</code>');
        expect(toc).toEqual([
            {
                id: 'using-firstorcreate-safely',
                text: 'Using firstOrCreate() safely',
                level: 2,
            },
        ]);
    });

    it('falls back to a "section" id when the heading has no slug-worthy text', async () => {
        const { toc } = await renderMarkdown('## ???');

        expect(toc).toEqual([{ id: 'section', text: '???', level: 2 }]);
    });

    it('keeps the footnotes heading, which already has an id, out of the TOC', async () => {
        const { toc } = await renderMarkdown(
            '## Body\n\nText[^1]\n\n[^1]: The note.'
        );

        expect(toc).toEqual([{ id: 'body', text: 'Body', level: 2 }]);
    });
});

describe('renderMarkdown code fences', () => {
    it('wraps Shiki output in a figure.code-block with a language badge and copy slot', async () => {
        const { html } = await renderMarkdown('```ts\nconst answer = 42;\n```');

        expect(html).toContain(
            '<figure class="code-block not-prose" data-spotlight-surface="true">'
        );
        expect(html).toContain('<span class="code-block__lang">ts</span>');
        expect(html).toContain(
            '<span class="code-block__copy" data-code-copy>'
        );
        expect(html).toContain(
            'class="shiki shiki-themes github-light github-dark"'
        );
        expect(html).not.toContain('code-block__path');
    });

    it('shows a bare trailing path and labels the badge with its extension', async () => {
        const { html } = await renderMarkdown(
            '```ts src/app/page.tsx\nconst answer = 42;\n```'
        );

        expect(html).toContain(
            '<span class="code-block__path">src/app/page.tsx</span>'
        );
        expect(html).toContain('<span class="code-block__lang">tsx</span>');
    });

    it('reads the path from a title="..." attribute', async () => {
        const { html } = await renderMarkdown(
            '```bash title="scripts/run.sh"\necho hi\n```'
        );

        expect(html).toContain(
            '<span class="code-block__path">scripts/run.sh</span>'
        );
        expect(html).toContain('<span class="code-block__lang">sh</span>');
    });

    it('labels an unlabelled fence as text', async () => {
        const { html } = await renderMarkdown('```\nplain words\n```');

        expect(html).toContain('<span class="code-block__lang">text</span>');
        expect(html).toContain('plain words');
    });

    it('still renders an unknown language instead of failing the build', async () => {
        const { html } = await renderMarkdown(
            '```notalanguage\nsome code\n```'
        );

        expect(html).toContain(
            '<span class="code-block__lang">notalanguage</span>'
        );
        expect(html).toContain('class="shiki');
        expect(html).toContain('some code');
    });

    it('emits mermaid fences as an escaped pre.mermaid, not a highlighted block', async () => {
        const { html } = await renderMarkdown(
            '```mermaid\ngraph TD; A-->B & <C>\n```'
        );

        expect(html).toBe(
            '<pre class="mermaid not-prose">graph TD; A--&gt;B &amp; &lt;C&gt;</pre>'
        );
    });

    it('emits reactflow fences as an escaped pre.reactflow', async () => {
        const { html } = await renderMarkdown(
            '```reactflow\nnodes: a <b> & c\n```'
        );

        expect(html).toBe(
            '<pre class="reactflow not-prose">nodes: a &lt;b&gt; &amp; c</pre>'
        );
    });
});

describe('renderMarkdown inline and block extensions', () => {
    it('turns ==text== into a mark', async () => {
        const { html } = await renderMarkdown('A ==key== point');

        expect(html).toContain('<mark>key</mark>');
    });

    it('turns ~text~ into a subscript while ~~text~~ still strikes through', async () => {
        const { html } = await renderMarkdown('H~2~O and ~~gone~~');

        expect(html).toContain('H<sub>2</sub>O');
        expect(html).toContain('<del>gone</del>');
    });

    it('turns ^text^ into a superscript', async () => {
        const { html } = await renderMarkdown('x^2^');

        expect(html).toContain('x<sup>2</sup>');
    });

    it('keeps inline formatting inside a wrapped span', async () => {
        const { html } = await renderMarkdown('==**bold** note==');

        expect(html).toContain('<mark><strong>bold</strong> note</mark>');
    });

    it('renders a term followed by ": definition" lines as a definition list', async () => {
        const { html } = await renderMarkdown(
            'Term\n: Definition one\n: Definition two'
        );

        expect(html).toBe(
            '<dl><dt>Term</dt><dd>Definition one</dd><dd>Definition two</dd></dl>'
        );
    });

    it('renders footnote references and a footnotes section', async () => {
        const { html } = await renderMarkdown('Text[^1]\n\n[^1]: The note.');

        expect(html).toContain('href="#footnote-1"');
        expect(html).toContain('<section class="footnotes" data-footnotes>');
        expect(html).toContain('The note.');
    });

    it('renders GitHub alerts as markdown-alert blocks', async () => {
        const { html } = await renderMarkdown('> [!WARNING]\n> Careful here');

        expect(html).toContain('class="markdown-alert markdown-alert-warning"');
        expect(html).toContain('Careful here');
    });

    it('renders :emoji: shortcodes as Unicode characters', async () => {
        const { html } = await renderMarkdown(':rocket: shipped');

        expect(html).toContain('\u{1F680} shipped');
        expect(html).not.toContain('<img');
    });

    it('wraps tables in a table-window frame and a table-scroll container', async () => {
        const { html } = await renderMarkdown(
            '| a | b |\n| - | - |\n| 1 | 2 |'
        );

        expect(html.trim()).toMatch(
            /^<div class="table-window not-prose" data-spotlight-surface="true"><div class="table-scroll"><table>[\s\S]*<\/table><\/div><\/div>$/
        );
    });

    it('leaves tables inside embedded HTML with attributes unwrapped', async () => {
        const { html } = await renderMarkdown(
            '<table class="gist-table"><tr><td>1</td></tr></table>'
        );

        expect(html).not.toContain('table-window');
    });
});

describe('renderMarkdown gist embeds', () => {
    it('inlines the gist markup and stylesheet fetched from the .json endpoint', async () => {
        const fetchMock = vi.fn(async () =>
            gistResponse(true, {
                div: '<div class="gist">embedded</div>',
                stylesheet: '//github.githubassets.com/gist.css',
            })
        );
        vi.stubGlobal('fetch', fetchMock);

        const { html } = await renderMarkdown(`${GIST_URL}\n`);

        expect(fetchMock).toHaveBeenCalledWith(`${GIST_URL}.json`);
        expect(html).toContain('<div class="not-prose gist-embed"');
        expect(html).toContain('<div class="gist">embedded</div>');
        expect(html).toContain(
            '<link rel="stylesheet" href="https://github.githubassets.com/gist.css" />'
        );
    });

    it('accepts a gist URL written with a .js suffix', async () => {
        const fetchMock = vi.fn(async () =>
            gistResponse(true, { div: '<div class="gist">embedded</div>' })
        );
        vi.stubGlobal('fetch', fetchMock);

        const { html } = await renderMarkdown(`${GIST_URL}.js`);

        expect(fetchMock).toHaveBeenCalledWith(`${GIST_URL}.json`);
        expect(html).toContain('<div class="gist">embedded</div>');
        expect(html).not.toContain('<link rel="stylesheet"');
    });

    it('falls back to a plain link when the gist responds with an error', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => gistResponse(false, {}))
        );

        const { html } = await renderMarkdown(GIST_URL);

        expect(html).toContain('gist-embed--fallback');
        expect(html).toContain(`<a href="${GIST_URL}"`);
        expect(html).toContain('View this gist on GitHub');
    });

    it('falls back to a plain link when the response has no markup', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => gistResponse(true, { stylesheet: 'x.css' }))
        );

        const { html } = await renderMarkdown(GIST_URL);

        expect(html).toContain('gist-embed--fallback');
    });

    it('falls back to a plain link when the network request fails', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                throw new Error('offline');
            })
        );

        const { html } = await renderMarkdown(GIST_URL);

        expect(html).toContain('gist-embed--fallback');
    });
});
