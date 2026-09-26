import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const PORT = 4321;

// Browser tests run against the real static export (./out), served the way
// GitHub Pages serves it, so run `pnpm build` first. Each project is a screen
// size: desktop runs every spec, the smaller screens run the specs whose
// behaviour changes with the layout.
export default defineConfig({
    testDir: 'tests/e2e',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 2 : undefined,
    reporter: isCI
        ? [['github'], ['html', { open: 'never' }]]
        : [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        // The service worker would answer requests before page.route can see
        // them; the PWA spec turns it back on for itself.
        serviceWorkers: 'block',
    },
    webServer: {
        command: `pnpm preview --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !isCI,
        timeout: 60_000,
    },
    projects: [
        {
            name: 'desktop',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 900 },
            },
        },
        {
            name: 'laptop',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1024, height: 768 },
            },
            testMatch: /(responsive|navigation)\.spec\.ts/,
        },
        {
            name: 'tablet',
            use: { ...devices['Galaxy Tab S4'] },
            testMatch: /(responsive|a11y)\.spec\.ts/,
        },
        {
            name: 'mobile',
            use: { ...devices['Pixel 7'] },
            testMatch:
                /(responsive|a11y|navigation|theme|home|contact|articles|article|pages)\.spec\.ts/,
        },
    ],
});
