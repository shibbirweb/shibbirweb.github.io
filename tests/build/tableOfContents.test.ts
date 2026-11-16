import { describe, expect, it } from 'vitest';
import { getAllArticles, getArticle } from '@/lib/posts';
import { loadPage } from '@tests/build/helpers';

// The desktop TOC rail is measured and drawn in the browser, but it reads each
// entry's nesting depth from the exported markup, so every link must ship
// with a `data-toc-depth` that matches its heading level.
describe('article table of contents', () => {
    it.each(getAllArticles().map((article) => article.slug))(
        '%s ships each TOC link with its rail depth',
        async (slug) => {
            const article = (await getArticle(slug))!;
            const nav = loadPage(`articles/${slug}.html`).querySelector(
                'nav[aria-label="Table of contents"]'
            );
            const links = [...(nav?.querySelectorAll('a') ?? [])];

            expect(links.map((link) => link.getAttribute('href'))).toEqual(
                article.toc.map((item) => `#${item.id}`)
            );
            expect(
                links.map((link) => link.getAttribute('data-toc-depth'))
            ).toEqual(article.toc.map((item) => (item.level >= 3 ? '1' : '0')));
        }
    );
});
