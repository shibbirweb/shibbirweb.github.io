/**
 * Selected work, curated from real public repositories.
 *
 * NOTE: the descriptions below are concise, honest summaries inferred from the
 * repos. Refine the copy, and add real outcome metrics (downloads, installs,
 * stars, perf numbers) plus Marketplace/npm/demo links via `links` where they
 * exist. Do NOT add metrics you can't back up.
 */
export type ProjectExternalLink = {
    url: string;
    label: string;
};

export type Project = {
    name: string;
    category: string;
    description: string;
    tech: string[];
    repoURL: string;
    links?: ProjectExternalLink[];
};

// Reusable tools published for others (VS Code Marketplace, npm). These carry
// `links` to their distribution page alongside the source repo.
export const packageProjects: Project[] = [
    {
        name: 'Extra Cursor Caret Height',
        category: 'VS Code Extension',
        description:
            'A Visual Studio Code extension that adds configurable extra height to the cursor caret, making it easier to track the caret while editing.',
        tech: ['TypeScript', 'VS Code API'],
        repoURL:
            'https://github.com/shibbirweb/vs-code-extra-cursor-caret-height',
        links: [
            {
                url: 'https://marketplace.visualstudio.com/items?itemName=shibbirweb.extra-cursor-caret-height',
                label: 'Marketplace',
            },
            {
                url: 'https://open-vsx.org/extension/shibbirweb/extra-cursor-caret-height',
                label: 'Open VSX',
            },
        ],
    },
    {
        name: 'CKEditor 5 Image Remove Callback',
        category: 'CKEditor 5 Plugin',
        description:
            'A CKEditor 5 plugin that exposes an event callback when an image is removed from the editor, so applications can react (e.g. clean up uploaded files).',
        tech: ['JavaScript', 'CKEditor 5'],
        repoURL:
            'https://github.com/shibbirweb/ckeditor5-image-remove-event-callback-plugin',
        links: [
            {
                url: 'https://www.npmjs.com/package/ckeditor5-image-remove-event-callback-plugin',
                label: 'npm',
            },
        ],
    },
    {
        name: 'Advanced Laravel Vue Paginate',
        category: 'Vue.js Package',
        description:
            'A Vue.js pagination component that renders Laravel paginator responses out of the box, with a customizable, ready-to-use paginate UI.',
        tech: ['Vue.js', 'JavaScript', 'Laravel'],
        repoURL:
            'https://github.com/shibbirweb/advanced-laravel-vue-paginate',
        links: [
            {
                url: 'https://www.npmjs.com/package/advanced-laravel-vue-paginate',
                label: 'npm',
            },
        ],
    },
    {
        name: 'Shibbir CLI',
        category: 'CLI Tool',
        description:
            'A Node.js command-line tool bundling helpful commands to run on your machine, packaging frequently used developer workflows.',
        tech: ['Node.js', 'JavaScript'],
        repoURL: 'https://github.com/shibbirweb/shibbir-cli',
    },
];

// Public repos built for personal use, learning, or practice. Source only, no
// distribution page.
export const personalProjects: Project[] = [
    {
        name: 'Nginx Load Balancer',
        category: 'DevOps / Infrastructure',
        description:
            'An nginx-based load-balancing setup exploring traffic distribution across multiple upstream application instances.',
        tech: ['Nginx', 'JavaScript', 'Docker'],
        repoURL: 'https://github.com/shibbirweb/p-nginx-load-balancer',
    },
    {
        name: 'Cloudflare DNS & Server Manager',
        category: 'Control Panel',
        description:
            'A Laravel and React (Inertia) control panel to manage remote servers over SSH with an in-browser terminal, provision sites, issue WordPress magic-login tokens, and manage Cloudflare DNS records.',
        tech: [
            'PHP',
            'Laravel',
            'Inertia.js',
            'React',
            'TypeScript',
            'Cloudflare API',
            'WordPress',
        ],
        repoURL: 'https://github.com/shibbirweb/dns-manager',
    },
];
