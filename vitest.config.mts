import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Three suites share one config:
// - unit: pure logic and content checks (`*.test.ts`), run in Node.
// - component: React components and hooks (`*.test.tsx`), run in jsdom.
// - build: checks against the static export in ./out, so `pnpm build` must
//   run first (see `pnpm test:build`).
// Unit and component tests are colocated beside the code they cover; the
// build suite lives in tests/build because it covers the whole export.
export default defineConfig({
    // Components import CSS Modules for their class names only. An inline,
    // empty PostCSS config stops Vite loading postcss.config.mjs (whose string
    // plugin list Vite cannot read), so modules resolve without Tailwind.
    css: {
        postcss: { plugins: [] },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
        },
    },
    test: {
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    environment: 'node',
                    include: ['src/**/*.test.ts', 'tests/content/**/*.test.ts'],
                    setupFiles: ['tests/setup/unit.ts'],
                },
            },
            {
                extends: true,
                test: {
                    name: 'component',
                    environment: 'jsdom',
                    include: ['src/**/*.test.tsx'],
                    setupFiles: ['tests/setup/component.ts'],
                },
            },
            {
                extends: true,
                test: {
                    name: 'build',
                    environment: 'node',
                    include: ['tests/build/**/*.test.ts'],
                    setupFiles: ['tests/setup/build.ts'],
                },
            },
        ],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/*.test.{ts,tsx}', 'src/components/icons/**'],
            reporter: ['text-summary', 'html'],
        },
    },
});
