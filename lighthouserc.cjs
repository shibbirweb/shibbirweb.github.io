// Lighthouse CI: audits the real static export for performance, accessibility,
// best practices and SEO, and fails the PR when a score drops below the floor.
// Run `pnpm build` first; `pnpm test:lighthouse` serves ./out and audits it.
//
// Pages are served by `pnpm preview` (scripts/serve-out.ts), which resolves
// clean URLs and gzips like GitHub Pages. LHCI's own static server would need
// `.html` URLs, which changes the pathname the app sees and breaks hydration.
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const PORT = 4323;
const origin = `http://localhost:${PORT}`;

// Audit the newest article too, so article pages (diagrams, code, comments)
// keep their scores. It is read from the exported feed, so no slug is pinned.
function newestArticlePath() {
    try {
        const feed = JSON.parse(
            readFileSync(join(__dirname, 'out', 'feed.json'), 'utf8')
        );
        if (feed.items.length === 0) {
            return null;
        }
        return new URL(feed.items[0].url).pathname;
    } catch {
        return null;
    }
}

const paths = [
    '/',
    '/articles',
    newestArticlePath(),
    '/resume',
    '/uses',
].filter(Boolean);

module.exports = {
    ci: {
        collect: {
            startServerCommand: `pnpm preview --port ${PORT}`,
            startServerReadyPattern: 'Serving ./out',
            url: paths.map((path) => `${origin}${path}`),
            // Three runs per page; the median is asserted to smooth out noise.
            numberOfRuns: 3,
            settings: {
                // Third-party scripts (GTM, giscus) are not ours to budget. The
                // footer's GitHub activity proxy (githubActivityURL in
                // SignatureSpotlight/contents.ts) is blocked too: its answer
                // depends on a service we do not run, and an error from it
                // would fail errors-in-console. The footer falls back to its
                // decorative graph, which is what gets audited.
                blockedUrlPatterns: [
                    '*googletagmanager.com*',
                    '*giscus.app*',
                    '*hcaptcha.com*',
                    '*github-contributions-api.jogruber.de*',
                ],
            },
        },
        assert: {
            assertions: {
                // CI runners are slower and noisier than a laptop; 0.8 catches real
                // regressions (local runs score about 0.9) without flaky PRs.
                'categories:performance': ['error', { minScore: 0.8 }],
                'categories:accessibility': ['error', { minScore: 0.95 }],
                'categories:best-practices': ['error', { minScore: 0.9 }],
                'categories:seo': ['error', { minScore: 0.95 }],
                // Any console error (a hydration mismatch, a crash) fails.
                'errors-in-console': 'error',
                'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
                'largest-contentful-paint': ['warn', { maxNumericValue: 3500 }],
                'total-blocking-time': ['warn', { maxNumericValue: 300 }],
            },
        },
        upload: {
            target: 'filesystem',
            outputDir: '.lighthouseci/reports',
        },
    },
};
