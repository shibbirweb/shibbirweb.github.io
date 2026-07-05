import type { GuideGroup } from '@/components/pages/article-editor/ArticleEditor/WritingGuide/types';

/**
 * The single source for the writing guide copy. The frontmatter group mirrors the
 * Appendix field table; the body group mirrors every feature in `SAMPLE_DRAFT`, so
 * each body `insert` is byte-identical to what `renderMarkdown` and the production
 * article page already handle. Keep both groups in sync with the anatomy contract.
 */
export const guideGroups: GuideGroup[] = [
    {
        title: 'Frontmatter',
        entries: [
            {
                label: 'title',
                note: 'string, required. Rendered as the h1, card title, and SEO title. Set it in the Title field.',
                snippet: "title: 'Building a Reliable Article Workflow'",
            },
            {
                label: 'description',
                note: 'string, recommended. Subtitle, card text, and the SEO/OG description. Description field.',
                snippet: "description: 'Design a writing workflow with structured metadata and an exact production preview.'",
            },
            {
                label: 'date',
                note: "YYYY-MM-DD string, required. Sort key (newest first) and JSON-LD datePublished. Publish date field.",
                snippet: "date: '2026-07-04'",
            },
            {
                label: 'updated',
                note: 'YYYY-MM-DD string, optional. Shown as the updated date and OG modifiedTime. Updated date field.',
                snippet: "updated: '2026-07-05'",
            },
            {
                label: 'tags',
                note: 'string list, optional. Tag chips and a related-post signal. Tags field (reuse existing tags instead of near-duplicates).',
                snippet: "tags: ['Next.js', 'Markdown', 'Developer Tools']",
            },
            {
                label: 'cover',
                note: 'path string, optional. Card thumbnail and article cover; an SVG is auto-generated per slug when omitted. Cover path field.',
                snippet: "cover: '/images/articles/github-actions-static-deploy.svg'",
            },
            {
                label: 'category',
                note: 'string, optional. A broader grouping and a related-post signal. Category field.',
                snippet: "category: 'Developer Experience'",
            },
            {
                label: 'difficulty',
                note: 'Beginner | Intermediate | Advanced, optional. Header difficulty badge. Difficulty select.',
                snippet: "difficulty: 'Intermediate'",
            },
            {
                label: 'tech',
                note: 'string list, optional. The stack strip under the header. Tech field.',
                snippet: "tech: ['Next.js', 'TypeScript', 'Shiki']",
            },
            {
                label: 'learn',
                note: "string list, optional. The \"What you'll learn\" card. What readers will learn field.",
                snippet: `learn:
    - 'Model article metadata without hand-editing YAML'
    - 'Preview code, diagrams, gists, and images safely'`,
            },
            {
                label: 'series',
                note: 'name + order, optional. Series nav, shown only when the series has two or more published parts. Part of a series toggle.',
                snippet: `series:
    name: 'Building a Knowledge Platform'
    order: 1`,
            },
            {
                label: 'draft',
                note: 'boolean, optional. Written only when true; keeps the file out of the published build. Draft toggle.',
                snippet: 'draft: true',
            },
        ],
    },
    {
        title: 'Body',
        entries: [
            {
                label: 'Intro paragraph (no H1)',
                note: 'The title comes from frontmatter, so the body has no H1. Open with an intro paragraph above the first heading.',
                snippet: 'A good writing tool removes formatting chores without hiding the Markdown that ultimately ships.',
                insert: 'A good writing tool removes formatting chores without hiding the Markdown that ultimately ships.\n',
            },
            {
                label: 'Section heading (##)',
                note: 'Sections start at ##. Both ## and ### get stable id anchors and populate the table of contents.',
                snippet: '## Start with the article contract',
                insert: '## Start with the article contract\n',
            },
            {
                label: 'Subheading (###)',
                note: 'A ### subheading also earns a TOC anchor; deeper levels do not appear in the TOC.',
                snippet: '### Validate the important fields',
                insert: '### Validate the important fields\n',
            },
            {
                label: 'Bullet list',
                note: 'A standard Markdown unordered list.',
                snippet: `- Give every article a useful title and description.
- Reuse existing tags instead of creating near-duplicates.
- Keep drafts out of the published collection.`,
                insert: `- Give every article a useful title and description.
- Reuse existing tags instead of creating near-duplicates.
- Keep drafts out of the published collection.
`,
            },
            {
                label: 'Inline code',
                note: 'Wrap short code in backticks for inline styling.',
                snippet: 'The editor keeps metadata structured while leaving the body as plain `Markdown`.',
                insert: 'The editor keeps metadata structured while leaving the body as plain `Markdown`.\n',
            },
            {
                label: 'Code fence (language)',
                note: 'A bare language info string. Shiki renders dual light/dark themes with a copy button.',
                snippet: `\`\`\`ts
const status = draft ? 'draft' : 'published';
\`\`\``,
                insert: `\`\`\`ts
const status = draft ? 'draft' : 'published';
\`\`\`
`,
            },
            {
                label: 'Code fence (language + path)',
                note: 'Add a file path after the language; the block header shows the file extension.',
                snippet: `\`\`\`tsx src/components/Editor.tsx
export default function Editor() {
    return <main>Write with confidence.</main>;
}
\`\`\``,
                insert: `\`\`\`tsx src/components/Editor.tsx
export default function Editor() {
    return <main>Write with confidence.</main>;
}
\`\`\`
`,
            },
            {
                label: 'Code fence (language + title)',
                note: 'The title="..." form is equivalent to the path form and also drives the block header.',
                snippet: `\`\`\`ts title="src/lib/article.ts"
export const article = { title: 'A reliable workflow' };
\`\`\``,
                insert: `\`\`\`ts title="src/lib/article.ts"
export const article = { title: 'A reliable workflow' };
\`\`\`
`,
            },
            {
                label: 'Mermaid diagram',
                note: 'A mermaid fence renders client-side to an interactive (pan/zoom/full-screen) SVG, with a plain-text fallback.',
                snippet: `\`\`\`mermaid
flowchart LR
    Form --> Markdown
    Markdown --> Preview
    Preview --> Save
\`\`\``,
                insert: `\`\`\`mermaid
flowchart LR
    Form --> Markdown
    Markdown --> Preview
    Preview --> Save
\`\`\`
`,
            },
            {
                label: 'Gist embed',
                note: 'A bare gist URL alone on its own line is fetched and inlined; on failure it degrades to a link.',
                snippet: 'https://gist.github.com/BobNisco/9372605',
                insert: 'https://gist.github.com/BobNisco/9372605\n',
            },
            {
                label: 'Image',
                note: 'Standard Markdown image; article images get a lightbox. Keep the alt text meaningful.',
                snippet: '![Cache-aside read path used as a sample article image.](/images/articles/inline/redis-cache-aside.svg)',
                insert: '![Cache-aside read path used as a sample article image.](/images/articles/inline/redis-cache-aside.svg)\n',
            },
            {
                label: 'Link',
                note: 'A standard Markdown link.',
                snippet: 'The final preview should match the [published articles](/articles), including every interactive enhancement.',
                insert: 'The final preview should match the [published articles](/articles), including every interactive enhancement.\n',
            },
            {
                label: 'Blockquote',
                note: 'Quote a source or call something out with a leading >.',
                snippet: '> A blockquote for quoting a source or setting a passage apart.',
                insert: '> A blockquote for quoting a source or setting a passage apart.\n',
            },
            {
                label: 'Ordered list',
                note: 'A numbered list for sequential steps.',
                snippet: `1. First step.
2. Second step.
3. Third step.`,
                insert: `1. First step.
2. Second step.
3. Third step.
`,
            },
            {
                label: 'Table',
                note: 'A GFM pipe table; the header separator row sets the columns. Wide tables scroll within the column.',
                snippet: `| Feature | Supported |
| --- | --- |
| Tables | Yes |
| Footnotes | Yes |`,
                insert: `| Feature | Supported |
| --- | --- |
| Tables | Yes |
| Footnotes | Yes |
`,
            },
            {
                label: 'Task list',
                note: 'Checkboxes with - [ ] (open) and - [x] (done).',
                snippet: `- [x] Completed item
- [ ] Pending item`,
                insert: `- [x] Completed item
- [ ] Pending item
`,
            },
            {
                label: 'Strikethrough',
                note: 'Wrap text in ~~ to strike it through.',
                snippet: 'This idea is ~~deprecated~~ and replaced by a better one.',
                insert: 'This idea is ~~deprecated~~ and replaced by a better one.\n',
            },
            {
                label: 'Footnote',
                note: 'A [^ref] marker links to a note collected at the bottom of the article, with a back-link.',
                snippet: `Here is a claim that needs a source.[^ref]

[^ref]: The supporting note, shown at the bottom of the article.`,
                insert: `Here is a claim that needs a source.[^ref]

[^ref]: The supporting note, shown at the bottom of the article.
`,
            },
            {
                label: 'Emoji',
                note: 'A :shortcode: renders to the matching emoji (GitHub names).',
                snippet: 'Ship it :tada: and celebrate :rocket:.',
                insert: 'Ship it :tada: and celebrate :rocket:.\n',
            },
            {
                label: 'GitHub alert',
                note: 'A blockquote starting with [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], or [!CAUTION] renders as a colored callout.',
                snippet: `> [!NOTE]
> Useful information the reader should notice.`,
                insert: `> [!NOTE]
> Useful information the reader should notice.
`,
            },
            {
                label: 'Highlight',
                note: 'Wrap text in == to highlight it (rendered as <mark>).',
                snippet: 'Use ==highlighted text== to draw the eye.',
                insert: 'Use ==highlighted text== to draw the eye.\n',
            },
            {
                label: 'Subscript / superscript',
                note: 'Single ~x~ is subscript and ^x^ is superscript (distinct from ~~strikethrough~~).',
                snippet: 'Water is H~2~O and a square is x^2^.',
                insert: 'Water is H~2~O and a square is x^2^.\n',
            },
            {
                label: 'Definition list',
                note: 'A term line followed by one or more `: definition` lines.',
                snippet: `HTTP
: A protocol for transferring hypertext.`,
                insert: `HTTP
: A protocol for transferring hypertext.
`,
            },
            {
                label: 'Custom heading ID',
                note: 'Append {#custom-id} to a heading to set its anchor explicitly instead of the auto slug.',
                snippet: '## Section title {#custom-anchor}',
                insert: '## Section title {#custom-anchor}\n',
            },
            {
                label: 'Raw HTML',
                note: 'Raw HTML passes through, e.g. <kbd> keys or a <details> disclosure.',
                snippet: `Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.

<details>
<summary>Show more</summary>

Hidden detail revealed on click.

</details>`,
                insert: `Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.

<details>
<summary>Show more</summary>

Hidden detail revealed on click.

</details>
`,
            },
        ],
    },
];
