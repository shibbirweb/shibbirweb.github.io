import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const PORT = 3000;

// Browser tests against `next dev` (Turbopack), not the static export.
//
// The main suite (playwright.config.ts) tests ./out, which is built with
// webpack and leaves out the dev-only routes (`*.dev.tsx`, such as the article
// editor). A page that only breaks under Turbopack, or a dev-only route that
// stops compiling, passes every other suite; these specs open those pages the
// way the maintainer does. Locally they reuse a running `pnpm dev` on port 3000.
export default defineConfig({
    testDir: 'tests/e2e-dev',
    fullyParallel: false,
    forbidOnly: isCI,
    retries: isCI ? 1 : 0,
    workers: 1,
    // The first request to each route compiles it, which can take a while.
    timeout: 120_000,
    expect: { timeout: 30_000 },
    reporter: isCI
        ? [
              ['github'],
              [
                  'html',
                  { open: 'never', outputFolder: 'playwright-report-dev' },
              ],
          ]
        : [
              ['list'],
              [
                  'html',
                  { open: 'never', outputFolder: 'playwright-report-dev' },
              ],
          ],
    outputDir: 'test-results-dev',
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        serviceWorkers: 'block',
        navigationTimeout: 120_000,
    },
    webServer: {
        command: 'pnpm dev',
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !isCI,
        timeout: 240_000,
    },
    projects: [
        {
            name: 'desktop',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 900 },
            },
        },
    ],
});
