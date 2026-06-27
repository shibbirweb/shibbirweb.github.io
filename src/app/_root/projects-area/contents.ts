/**
 * Selected work — curated from real public repositories.
 *
 * NOTE: the descriptions below are concise, honest summaries inferred from the
 * repos. Refine the copy, and add real outcome metrics (downloads, installs,
 * stars, perf numbers) plus Marketplace/npm/demo links via `liveURL` where they
 * exist. Do NOT add metrics you can't back up.
 */
export type Project = {
    name: string;
    category: string;
    description: string;
    tech: string[];
    repoURL: string;
    liveURL?: string;
    liveLabel?: string;
    accentClassName: string;
};

export const projects: Project[] = [
    {
        name: 'VS Code Extra Cursor Caret Height',
        category: 'VS Code Extension',
        description:
            'A Visual Studio Code extension that adds configurable extra height to the cursor caret, making it easier to track the caret while editing.',
        tech: ['TypeScript', 'VS Code API'],
        repoURL:
            'https://github.com/shibbirweb/vs-code-extra-cursor-caret-height',
        accentClassName: 'decoration-blue-500',
    },
    {
        name: 'CKEditor 5 Image Remove Callback',
        category: 'CKEditor 5 Plugin',
        description:
            'A CKEditor 5 plugin that exposes an event callback when an image is removed from the editor, so applications can react — e.g. clean up uploaded files.',
        tech: ['JavaScript', 'CKEditor 5'],
        repoURL:
            'https://github.com/shibbirweb/ckeditor5-image-remove-event-callback-plugin',
        accentClassName: 'decoration-yellow-500',
    },
    {
        name: 'Nuxt 3 + Laravel Sanctum Auth',
        category: 'Full-Stack Demo',
        description:
            'A reference implementation of SPA authentication using Nuxt 3 on the frontend and Laravel Sanctum on the backend.',
        tech: ['Nuxt.js', 'Laravel', 'PHP', 'Vue.js'],
        repoURL:
            'https://github.com/shibbirweb/demo-nuxt-3-laravel-sanctum-authentication',
        accentClassName: 'decoration-emerald-500',
    },
    {
        name: 'Nginx Load Balancer',
        category: 'DevOps / Infrastructure',
        description:
            'An nginx-based load-balancing setup exploring traffic distribution across multiple upstream application instances.',
        tech: ['Nginx', 'JavaScript', 'Docker'],
        repoURL: 'https://github.com/shibbirweb/p-nginx-load-balancer',
        accentClassName: 'decoration-indigo-500',
    },
    {
        name: 'DNS Manager',
        category: 'Developer Tool',
        description:
            'A PHP utility for managing DNS records programmatically.',
        tech: ['PHP'],
        repoURL: 'https://github.com/shibbirweb/dns-manager',
        accentClassName: 'decoration-rose-500',
    },
    {
        name: 'Shibbir CLI',
        category: 'CLI Tool',
        description:
            'A personal Node.js command-line tool that packages frequently used developer workflows.',
        tech: ['Node.js', 'JavaScript'],
        repoURL: 'https://github.com/shibbirweb/shibbir-cli',
        accentClassName: 'decoration-orange-500',
    },
];
