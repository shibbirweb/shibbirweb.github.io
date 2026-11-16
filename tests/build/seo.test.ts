import { XMLParser } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';
import {
    packageProjects,
    hobbyProjects,
} from '@/components/pages/home/ProjectsArea/contents';
import {
    aiShowcaseTitle,
    allSkills,
    builtOnLabel,
    featuredAiSkills,
    skillIconUrl,
    stackOverviewTitle,
} from '@/components/pages/home/SkillsArea/contents';
import { siteURL } from '@/config/constants';
import { teaserTagLimit } from '@/components/pages/articles/ArticleRow/ArticleRowTags';
import { getAllArticles, getLatestArticles } from '@/lib/posts';
import {
    jsonLdBlocks,
    listHtmlPages,
    loadPage,
    outExists,
    pagePath,
    readOut,
    resolveRoute,
    toSitePath,
} from '@tests/build/helpers';

// Pages that should never be indexed by search engines.
const NOINDEX_PAGES = ['articles/search.html', 'network-status.html'];
// Pages with no meaningful canonical/OG setup (error and offline shells).
const SHELL_PAGES = ['404.html', 'offline-fallback.html'];
const indexablePages = listHtmlPages().filter(
    (page) => !NOINDEX_PAGES.includes(page) && !SHELL_PAGES.includes(page)
);

function metaContent(document: Document, selector: string): string | null {
    return document.querySelector(selector)?.getAttribute('content') ?? null;
}

function jsonLdTypes(page: string): string[] {
    return jsonLdBlocks(page).flatMap((block) => {
        const type = block['@type'];
        return Array.isArray(type) ? type : [String(type)];
    });
}

describe('page metadata', () => {
    it.each(listHtmlPages())('%s has lang, a title and one h1', (page) => {
        const document = loadPage(page);

        expect(document.documentElement.getAttribute('lang')).toBe('en');
        expect(document.title.trim().length).toBeGreaterThan(0);
        expect(document.querySelectorAll('h1')).toHaveLength(1);
    });

    it.each(indexablePages)(
        '%s has description, canonical and OG tags',
        (page) => {
            const document = loadPage(page);
            const canonical = document
                .querySelector('link[rel="canonical"]')
                ?.getAttribute('href');

            expect(
                metaContent(document, 'meta[name="description"]')?.length
            ).toBeGreaterThan(20);
            expect(canonical).toBe(
                pagePath(page) === '/' ? siteURL : `${siteURL}${pagePath(page)}`
            );
            expect(
                metaContent(document, 'meta[property="og:title"]')
            ).toBeTruthy();
            expect(metaContent(document, 'meta[name="twitter:card"]')).toBe(
                'summary_large_image'
            );
        }
    );

    it.each(indexablePages)(
        '%s points og:image at an exported file',
        (page) => {
            const image = metaContent(
                loadPage(page),
                'meta[property="og:image"]'
            );

            expect(image).toMatch(/^https:\/\//);
            expect(resolveRoute(toSitePath(image!))).not.toBeNull();
        }
    );

    it.each(NOINDEX_PAGES)('%s asks search engines not to index it', (page) => {
        expect(metaContent(loadPage(page), 'meta[name="robots"]')).toContain(
            'noindex'
        );
    });

    it('advertises the RSS, Atom and JSON feeds on the home page', () => {
        const alternates = [
            ...loadPage('index.html').querySelectorAll('link[rel="alternate"]'),
        ].map((link) => link.getAttribute('type'));

        expect(alternates).toEqual(
            expect.arrayContaining([
                'application/rss+xml',
                'application/atom+xml',
                'application/feed+json',
            ])
        );
    });
});

describe('home page projects', () => {
    it('ships every project card, including those behind "Show more"', () => {
        const document = loadPage('index.html');
        const work = document.getElementById('work');
        const cardHeadings = [...(work?.querySelectorAll('li h4') ?? [])].map(
            (heading) => heading.textContent?.trim()
        );

        for (const project of [...packageProjects, ...hobbyProjects]) {
            expect(cardHeadings).toContain(project.name);
        }
    });

    it('gives every project card its own glow colour across both groups', () => {
        const document = loadPage('index.html');
        // Cards are the spotlight surfaces; plain `li`s also match tech tags.
        const cards =
            document
                .getElementById('work')
                ?.querySelectorAll('li[data-spotlight-surface]') ?? [];
        const glowColours = [...cards].map(
            (card) => card.getAttribute('style')?.match(/--glow-a:([^;]+)/)?.[1]
        );

        expect(glowColours).toHaveLength(
            packageProjects.length + hobbyProjects.length
        );
        expect(glowColours).not.toContain(undefined);
        expect(new Set(glowColours).size).toBe(glowColours.length);
    });

    it('ships each full description, which is only clamped on screen', () => {
        const document = loadPage('index.html');
        const workText = document.getElementById('work')?.textContent ?? '';

        for (const project of [...packageProjects, ...hobbyProjects]) {
            expect(workText, project.name).toContain(project.description);
        }
    });

    it('ships every card with a labelled tech stack list in order', () => {
        const document = loadPage('index.html');
        const cards =
            document
                .getElementById('work')
                ?.querySelectorAll('li[data-spotlight-surface]') ?? [];
        const projects = [...packageProjects, ...hobbyProjects];

        expect(cards).toHaveLength(projects.length);
        projects.forEach((project, index) => {
            const techList = cards[index].querySelector(
                'ul[aria-label="Tech stack"]'
            );
            const tags = [...(techList?.querySelectorAll('li') ?? [])].map(
                (tag) => tag.textContent?.trim()
            );
            expect(tags, project.name).toEqual(project.tech);
        });
    });

    it('numbers the cards from 01 within each group', () => {
        const document = loadPage('index.html');
        const cards =
            document
                .getElementById('work')
                ?.querySelectorAll('li[data-spotlight-surface]') ?? [];
        const numbers = [...cards].map((card) =>
            card.querySelector('p span[aria-hidden]')?.textContent?.trim()
        );
        const groupNumbers = (count: number) =>
            Array.from({ length: count }, (_, index) =>
                String(index + 1).padStart(2, '0')
            );

        expect(numbers).toEqual([
            ...groupNumbers(packageProjects.length),
            ...groupNumbers(hobbyProjects.length),
        ]);
    });

    it('holds each "Show more" region hidden in the static HTML', () => {
        const document = loadPage('index.html');

        for (const regionId of [
            'more-package-projects',
            'more-hobby-projects',
        ]) {
            const region = document.getElementById(regionId);
            expect(region, regionId).not.toBeNull();
            expect(region?.hasAttribute('hidden'), regionId).toBe(true);
        }
    });
});

describe('home page articles', () => {
    const latest = getLatestArticles(3);

    function articleRows() {
        const section = loadPage('index.html').getElementById('articles');
        return [
            ...(section?.querySelectorAll('li[data-spotlight-surface]') ?? []),
        ];
    }

    it('ships the newest articles as rows, newest first', () => {
        const titles = articleRows().map((row) =>
            row.querySelector('h3')?.textContent?.trim()
        );

        expect(titles).toEqual(latest.map((article) => article.title));
    });

    it('links each row to its article and ships the full description', () => {
        articleRows().forEach((row, index) => {
            const article = latest[index];
            expect(
                row.querySelector(`a[href="/articles/${article.slug}"]`),
                article.slug
            ).not.toBeNull();
            expect(row.textContent, article.slug).toContain(
                article.description
            );
        });
    });

    it('dates each row with a machine-readable time', () => {
        articleRows().forEach((row, index) => {
            expect(
                row.querySelector('time')?.getAttribute('datetime'),
                latest[index].slug
            ).toBe(latest[index].date);
        });
    });

    it(`links at most ${teaserTagLimit} tags per row to the filtered list`, () => {
        articleRows().forEach((row, index) => {
            const tagLinks = [
                ...row.querySelectorAll('ul[aria-label="Tags"] a'),
            ].map((link) => link.getAttribute('href'));
            const expectedTags = latest[index].tags.slice(0, teaserTagLimit);

            expect(tagLinks, latest[index].slug).toEqual(
                expectedTags.map(
                    (tag) => `/articles?tag=${encodeURIComponent(tag)}`
                )
            );
        });
    });

    it('leaves the cover images out of the home teaser', () => {
        const section = loadPage('index.html').getElementById('articles');

        expect(section?.querySelectorAll('img')).toHaveLength(0);
    });
});

describe('home page skills', () => {
    it('ships every skill name and featured summary in the static HTML', () => {
        const skillsText =
            loadPage('index.html').getElementById('skills')?.textContent ?? '';

        for (const skill of allSkills) {
            expect(skillsText, skill.name).toContain(skill.name);
        }
        for (const skill of featuredAiSkills) {
            expect(skillsText, skill.name).toContain(skill.summary);
        }
    });

    it('keeps the skill logos out of the HTML, to be fetched lazily', () => {
        const skills = loadPage('index.html').getElementById('skills');

        expect(skills?.querySelectorAll('svg')).toHaveLength(0);
        expect(
            skills
                ?.querySelector('[data-skill-icons]')
                ?.getAttribute('data-skill-icons')
        ).toBe('pending');
        expect(skills?.querySelectorAll('[data-skill-icon]')).toHaveLength(
            allSkills.length
        );
    });

    it('exports every skill logo file', () => {
        for (const skill of allSkills) {
            const iconPath = skillIconUrl(skill.icon).slice(1);
            expect(outExists(iconPath), iconPath).toBe(true);
        }
    });

    it('leads with the AI panel, ahead of the full-stack rows', () => {
        const headings = [
            ...(loadPage('index.html')
                .getElementById('skills')
                ?.querySelectorAll('h3') ?? []),
        ].map((heading) => heading.textContent?.trim());

        expect(headings).toEqual([aiShowcaseTitle, stackOverviewTitle]);
    });

    it('puts both halves on one panel, joined by "Built on"', () => {
        const skills = loadPage('index.html').getElementById('skills');
        const panels = skills?.querySelectorAll('[data-skills-panel]') ?? [];

        expect(panels).toHaveLength(1);
        const panelText = panels[0]?.textContent ?? '';
        const aiAt = panelText.indexOf(aiShowcaseTitle);
        const builtOnAt = panelText.indexOf(builtOnLabel);
        const stackAt = panelText.indexOf(stackOverviewTitle);
        expect(aiAt).toBeGreaterThanOrEqual(0);
        expect(builtOnAt).toBeGreaterThan(aiAt);
        expect(stackAt).toBeGreaterThan(builtOnAt);
    });

    it('renders the featured AI skills as spotlight cards', () => {
        const cards =
            loadPage('index.html')
                .getElementById('skills')
                ?.querySelectorAll('li[data-spotlight-surface] h4') ?? [];

        expect([...cards].map((heading) => heading.textContent)).toEqual(
            featuredAiSkills.map((skill) => skill.name)
        );
    });
});

describe('structured data (JSON-LD)', () => {
    it.each(listHtmlPages())('%s embeds only valid JSON-LD', (page) => {
        for (const block of jsonLdBlocks(page)) {
            expect(block['@context']).toBe('https://schema.org');
            expect(block['@type']).toBeTruthy();
        }
    });

    it('describes the person, website and navigation on the home page', () => {
        expect(jsonLdTypes('index.html')).toEqual(
            expect.arrayContaining(['ProfilePage', 'WebSite', 'ItemList'])
        );
    });

    it.each(getAllArticles().map((article) => article))(
        'marks up $slug as a BlogPosting with a breadcrumb',
        (article) => {
            const page = `articles/${article.slug}.html`;
            const posting = jsonLdBlocks(page).find(
                (block) => block['@type'] === 'BlogPosting'
            );

            expect(posting?.headline).toBe(article.title);
            expect(posting?.datePublished).toContain(article.date);
            expect(jsonLdTypes(page)).toContain('BreadcrumbList');
        }
    );

    it('marks up the resume as a ProfilePage', () => {
        expect(jsonLdTypes('resume.html')).toContain('ProfilePage');
    });
});

describe('sitemap and robots', () => {
    const sitemap = new XMLParser().parse(readOut('sitemap.xml')) as {
        urlset: { url: { loc: string }[] | { loc: string } };
    };
    const urls = [sitemap.urlset.url].flat().map((entry) => String(entry.loc));

    it('lists only absolute URLs on the site domain', () => {
        for (const url of urls) {
            expect(url.startsWith(siteURL)).toBe(true);
        }
    });

    it('lists only URLs that the export actually serves', () => {
        for (const url of urls) {
            expect(resolveRoute(toSitePath(url)), url).not.toBeNull();
        }
    });

    it('includes the main pages and every published article', () => {
        const paths = urls.map(toSitePath);

        expect(paths).toEqual(
            expect.arrayContaining([
                '/',
                '/uses',
                '/now',
                '/resume',
                '/articles',
            ])
        );
        for (const article of getAllArticles()) {
            expect(paths).toContain(`/articles/${article.slug}`);
        }
    });

    it('leaves out search, network status and the studio', () => {
        const paths = urls.map(toSitePath);

        expect(paths).not.toContain('/articles/search');
        expect(paths).not.toContain('/network-status');
        expect(paths.some((path) => path.startsWith('/studio'))).toBe(false);
    });

    it('allows crawling and points robots.txt at the sitemap', () => {
        const robots = readOut('robots.txt');

        expect(robots).toMatch(/User-Agent: \*/i);
        expect(robots).toMatch(/Allow: \//);
        expect(robots).toContain(`Sitemap: ${siteURL}/sitemap.xml`);
    });
});
