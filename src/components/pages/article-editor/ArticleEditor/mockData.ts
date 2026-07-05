import type {
    ArticleDraft,
    ArticleListItem,
    EditorSuggestions,
} from '@/components/pages/article-editor/ArticleEditor/types';

export const SAMPLE_DRAFT: ArticleDraft = {
    frontmatter: {
        title: 'Building a Reliable Article Workflow',
        description:
            'Design a writing workflow with structured metadata, rich Markdown, and an exact production preview.',
        date: '2026-07-04',
        updated: '2026-07-05',
        tags: ['Next.js', 'Markdown', 'Developer Tools'],
        cover: '/images/articles/github-actions-static-deploy.svg',
        category: 'Developer Experience',
        difficulty: 'Intermediate',
        tech: ['Next.js', 'TypeScript', 'Shiki'],
        learn: [
            'Model article metadata without hand-editing YAML',
            'Preview code, diagrams, gists, and images safely',
            'Keep authoring output aligned with production rendering',
        ],
        series: {
            name: 'Building a Knowledge Platform',
            order: 1,
        },
        draft: true,
    },
    body: `A good writing tool removes formatting chores without hiding the Markdown that ultimately ships.

## Start with the article contract

The editor keeps metadata structured while leaving the body as plain \`Markdown\`.

### Validate the important fields

- Give every article a useful title and description.
- Reuse existing tags instead of creating near-duplicates.
- Keep drafts out of the published collection.

\`\`\`ts
const status = draft ? 'draft' : 'published';
\`\`\`

\`\`\`tsx src/components/Editor.tsx
export default function Editor() {
    return <main>Write with confidence.</main>;
}
\`\`\`

\`\`\`ts title="src/lib/article.ts"
export const article = { title: 'A reliable workflow' };
\`\`\`

## Make the flow visible

\`\`\`mermaid
flowchart LR
    Form --> Markdown
    Markdown --> Preview
    Preview --> Save
\`\`\`

https://gist.github.com/BobNisco/9372605

![Cache-aside read path used as a sample article image.](/images/articles/inline/redis-cache-aside.svg)

## The full formatting palette {#formatting-palette}

> [!NOTE]
> GitHub-style alerts come in NOTE, TIP, IMPORTANT, WARNING, and CAUTION.

This line was ~~rewritten~~ for clarity, mentions H~2~O and x^2^, and ==highlights== the key term. Celebrate a clean build :tada:.

### Steps and checks

1. Draft the frontmatter.
2. Write the body.
3. Preview, then save.

- [x] Rendered by the production components
- [ ] Published to the live site

### Comparison table

| Feature | Renders |
| --- | --- |
| Footnotes | Yes |
| Emoji | Yes |
| Alerts | Yes |

### Definitions

Cache-aside
: The app reads the cache and falls back to the database on a miss.

Write-through
: Writes go through the cache so it never serves stale data.

You can cite a source inline[^workflow] and press <kbd>Cmd</kbd> + <kbd>S</kbd> to save.

<details>
<summary>Extra detail (raw HTML)</summary>

Raw HTML passes straight through the renderer.

</details>

The final preview should match the [published articles](/articles), including inline code and every interactive enhancement.

[^workflow]: Footnotes collect at the bottom of the article with a back-link.`,
};

export const MOCK_ARTICLE_LIST: ArticleListItem[] = [
    {
        file: '21-number-2-is-odd-or-even.md',
        slug: 'number-2-is-odd-or-even',
        title: 'Number 2 Is Odd or Even',
        status: 'published',
    },
    {
        file: '22-building-a-reliable-article-workflow.md',
        slug: 'building-a-reliable-article-workflow',
        title: 'Building a Reliable Article Workflow',
        status: 'draft',
    },
    {
        file: '19-nextjs-server-actions-forms.md',
        slug: 'nextjs-server-actions-forms',
        title: 'Next.js Server Actions and Forms',
        status: 'published',
    },
];

export const MOCK_SUGGESTIONS: EditorSuggestions = {
    tags: ['AI', 'Backend', 'Developer Tools', 'Markdown', 'Next.js'],
    categories: ['AI Engineering', 'Backend', 'Developer Experience'],
    seriesNames: ['Building a Knowledge Platform', 'Production Next.js'],
    tech: ['Next.js', 'Node.js', 'Shiki', 'TypeScript'],
};
