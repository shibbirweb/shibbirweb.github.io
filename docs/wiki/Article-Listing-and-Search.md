# Article listing and search

> **In short:** `/articles` is one static page. Tag filter and pagination use query strings (`?tag=Git&page=2`) and run in the browser. Search also runs in the browser over titles, tags, and descriptions. No search index file is built.

## Files involved

All component paths are under `src/components/pages/articles/`.

| File                                | What it does                                          |
| ----------------------------------- | ----------------------------------------------------- |
| `src/app/articles/page.tsx`         | Loads all articles and tags, renders `ArticlesIndex`. |
| `src/app/articles/search/page.tsx`  | The results page. Marked `noindex`.                   |
| `ArticlesIndex.tsx`                 | Page layout. Wraps the list in `<Suspense>`.          |
| `ArticlesList.tsx`                  | Reads `?tag` and `?page`, filters and slices.         |
| `TagFilter.tsx`, `Pagination.tsx`   | Tag pills and page links.                             |
| `ArticleGrid.tsx`, `ArticleCard/`   | The card grid (the default layout).                   |
| `ArticleRowList.tsx`, `ArticleRow/` | The row list (also the home Latest Articles).         |
| `ArticlesToolbar.tsx`               | Count or "found for" line, plus the layout toggle.    |
| `ArticlesViewToggle/`               | Grid/list toggle, saved choice, pre-paint script.     |
| `ArticlesResults.tsx`               | Shows a page as the grid or the rows.                 |
| `ArticlesIndexFallback/`            | The pre-rendered first page (always the grid).        |
| `ArticleSearch/`                    | Search box, `Cmd+K` modal, suggestions.               |
| `SearchResults/`                    | Results list on `/articles/search?q=...`.             |
| `src/utils/searchArticles.ts`       | The scoring function.                                 |
| `src/utils/pageHref.ts`             | Builds page links and keeps other query params.       |

## Listing

```mermaid
flowchart LR
    A[getAllArticles] --> B[ArticlesIndex]
    B --> C[Suspense]
    C --> D[ArticlesList]
    D --> E{?tag}
    E --> F[filter by exact tag]
    F --> G{?page}
    G --> H[slice 9 per page]
    H --> I[ArticlesToolbar + ArticlesResults + Pagination]
```

1. The route passes **every** article summary to the client.
2. `ArticlesList` reads `?tag=` and `?page=` with `useSearchParams`.
3. It filters by the exact tag, then shows 9 per page (`ARTICLES_PER_PAGE` in `posts.ts`).
4. A bad page number falls back to page 1.
5. `useSearchParams` needs a `<Suspense>` wrapper in a static export. The fallback (first page, no filter) is what ends up in the HTML, so crawlers and no JS visitors see page 1.

**Cards** show the cover, a series badge, date, reading time, title, description, and tag links. The cover colours tint the hover glow.

## Grid or list

The toolbar above the results has a **Grid view** / **List view** toggle. Grid is the default. **List** shows the compact `ArticleRow`s from the home page: a date tile in the cover colours, category, reading time, title, a 2-line description and up to 3 tag links.

- **The choice is saved in the browser** (`localStorage` key `articles-view`, see `articlesView.ts`). It stays across reloads, tag filters, pages, the search page, and other tabs.
- **No flash.** The static HTML is always the grid, because the saved choice can only be read in the browser. `ArticlesViewScript` (in the root layout's `<head>`, next to the theme script) marks `<html data-articles-view="list">` before first paint, and `ArticlesIndexFallback.module.css` keeps the pre-rendered grid invisible for those visitors until their list renders. Without JavaScript the mark is never set, so the grid shows.

## Search

```mermaid
sequenceDiagram
    participant U as User
    participant M as SearchModal
    participant S as searchArticles
    U->>M: Cmd+K or Ctrl+K
    U->>M: types a query
    M->>M: wait 160 ms (debounce)
    M->>S: query + all summaries
    S-->>M: ranked matches
    M-->>U: up to 6 suggestions
    U->>M: Enter
    M-->>U: open article, or /articles/search?q=...
```

**Scoring** (`searchArticles.ts`). Every word must match somewhere:

| Match                   | Points |
| ----------------------- | ------ |
| Title equals query      | 100    |
| Title starts with query | 40     |
| Title contains a word   | 20     |
| Tag equals a word       | 30     |
| Tag contains a word     | 12     |
| Description contains    | 4      |

Ties go to the newest post. The article body is **not** searched.

**Modal.** Opens with `Cmd+K` (Mac) or `Ctrl+K`. Arrow keys move, Enter opens, Escape closes. Focus is trapped inside while open. Matched words are wrapped in `<mark>`.

**Results page.** `/articles/search?q=...&page=2` reads the query on the client and shows three states: empty, no match, or results. Results use the same toolbar ("3 articles found for ...") and follow the saved grid/list choice. Series labels count every article, not just the matches.

## Good to know

- **Search works only where `ArticleSearch` is mounted**: `/articles` and `/articles/search`.
- **Big article counts** mean a bigger page, since all summaries ship in the HTML payload.
- `getArticlesForPage` and `getArticlePageCount` in `posts.ts` are not used anywhere.

## Related pages

- [Articles overview](Articles-Overview.md)
- [Article page](Article-Page.md)
