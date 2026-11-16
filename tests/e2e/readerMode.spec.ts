import { join } from 'node:path';
import { siteAuthor } from '@/config/constants';
import { DIAGRAM_FALLBACK_IMAGE_CLASS } from '@/components/pages/articles/diagramFallbackImage';
import {
    articlesWithFence,
    expect,
    test,
    waitForHydration,
} from '@tests/e2e/fixtures';

// Browser reading modes rebuild an article with Mozilla's Readability: Firefox
// Reader View uses it as is, and Chrome's Reading mode runs it over a clone of
// the live page. So the check runs the same library over the hydrated page and
// asserts on what a reader would get, while the page itself must keep the
// pre-rendered diagram images hidden and never download them.

const READABILITY_SCRIPT = join(
    process.cwd(),
    'node_modules/@mozilla/readability/Readability.js'
);

const fallbackImageSelector = `img.${DIAGRAM_FALLBACK_IMAGE_CLASS}`;

const diagramArticles = [
    ...new Map(
        [
            ...articlesWithFence('reactflow'),
            ...articlesWithFence('mermaid'),
        ].map((article) => [article.slug, article])
    ).values(),
];

interface ReaderView {
    title: string | null;
    byline: string | null;
    text: string;
    imageSources: string[];
}

test.describe('browser reading modes', () => {
    test.skip(diagramArticles.length === 0, 'no article has a diagram');
    const article = diagramArticles[0];

    test('keeps the diagram images hidden on the page and never fetches them', async ({
        page,
    }) => {
        const imageRequests: string[] = [];
        page.on('request', (request) => {
            if (new URL(request.url()).pathname.startsWith('/diagrams/')) {
                imageRequests.push(request.url());
            }
        });

        await page.goto(article.path);
        await waitForHydration(page);
        // Pass every diagram, so a lazy image that would load does load.
        await page.evaluate(async () => {
            for (
                let top = 0;
                top < document.body.scrollHeight;
                top += window.innerHeight / 2
            ) {
                window.scrollTo({ top, behavior: 'instant' });
                await new Promise((resolve) => requestAnimationFrame(resolve));
            }
        });

        const images = page.locator(fallbackImageSelector);
        expect(await images.count()).toBeGreaterThan(0);
        for (const image of await images.all()) {
            await expect(image).toBeHidden();
            await expect(image).toHaveCSS('display', 'none');
        }
        expect(imageRequests).toEqual([]);
    });

    test('gives a reading mode the byline and every diagram as an image', async ({
        page,
        request,
    }) => {
        await page.goto(article.path);
        await waitForHydration(page);
        const diagramCount = await page.locator(fallbackImageSelector).count();
        await page.addScriptTag({ path: READABILITY_SCRIPT });

        // Readability strips class names (and makes URLs absolute), so its
        // copy of a diagram image is found by where it points.
        const reader = await page.evaluate<ReaderView, string>((selector) => {
            const { Readability } = window as unknown as {
                Readability: new (document: Document) => {
                    parse(): {
                        title: string | null;
                        byline: string | null;
                        content: string | null;
                    } | null;
                };
            };
            const parsed = new Readability(
                document.cloneNode(true) as Document
            ).parse();
            const content = new DOMParser().parseFromString(
                parsed?.content ?? '',
                'text/html'
            );
            const images = [...content.querySelectorAll(selector)];
            return {
                title: parsed?.title ?? null,
                byline: parsed?.byline ?? null,
                text: content.body.textContent ?? '',
                imageSources: images.map(
                    (image) => image.getAttribute('src') ?? ''
                ),
            };
        }, 'img[src*="/diagrams/"]');

        expect(reader.title).toContain(article.title);
        expect(reader.byline).toContain(siteAuthor);
        expect(reader.imageSources).toHaveLength(diagramCount);
        expect(reader.text).not.toContain('Press Interactive');
        expect(reader.text).not.toContain('Share this article');

        for (const source of reader.imageSources) {
            const response = await request.get(source);
            expect(response.status(), source).toBe(200);
            expect(response.headers()['content-type']).toContain('image/png');
        }
    });
});
