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

/**
 * How many projects in each group stay on screen before its "Show more"
 * toggle. Bump one when a project should be visible without a click.
 */
export const collapsedPackageProjectCount = 4;
export const collapsedPersonalProjectCount = 2;

// Reusable tools published for others (VS Code Marketplace, npm). These carry
// `links` to their distribution page alongside the source repo.
export const packageProjects: Project[] = [
    {
        name: 'MCP DB Read-Only',
        category: 'MCP Server',
        description:
            'A Model Context Protocol server that lets AI assistants like Claude query MySQL, MariaDB, PostgreSQL, SQLite, SQL Server, ClickHouse, MongoDB, Redis and Elasticsearch/OpenSearch safely, with read-only access enforced both by query validation and at the database level, plus named profiles for switching databases without a restart.',
        tech: ['TypeScript', 'Node.js', 'MCP', 'Docker'],
        repoURL: 'https://github.com/shibbirweb/mcp-db-read-only',
        links: [
            {
                url: 'https://www.npmjs.com/package/@shibbirweb/mcp-db-read-only',
                label: 'npm',
            },
            {
                url: 'https://hub.docker.com/r/shibbirweb/mcp-db-read-only',
                label: 'Docker Hub',
            },
            {
                url: 'https://github.com/shibbirweb/mcp-db-read-only/wiki',
                label: 'Docs',
            },
        ],
    },
    {
        name: 'Flow Trace',
        category: 'AI Agent Skill',
        description:
            'An Agent Skill for Claude Code, Codex, Cursor, Copilot, Gemini CLI and OpenCode that turns "how does this request work?" into an animated, step-through page: one hop per file, the real code with the executing lines highlighted, plain-language notes, and a validator that checks every referenced file and line.',
        tech: ['Agent Skills', 'Claude Code', 'JavaScript', 'HTML'],
        repoURL: 'https://github.com/shibbirweb/flow-trace-skill',
        links: [
            {
                url: 'https://github.com/shibbirweb/flow-trace-skill/blob/main/INSTALL.md',
                label: 'Install',
            },
        ],
    },
    {
        name: 'Refactor Compare',
        category: 'AI Agent Skill',
        description:
            'An Agent Skill for Claude Code, Codex, Cursor, Copilot, Gemini CLI and OpenCode that builds an interactive before and after page for a refactor: pick a real example, step through the old and new code side by side, and see which lines run, what the diff added or removed, and how the values change.',
        tech: ['Agent Skills', 'Claude Code', 'JavaScript', 'Git'],
        repoURL: 'https://github.com/shibbirweb/refactor-compare-skill',
        links: [
            {
                url: 'https://github.com/shibbirweb/refactor-compare-skill/blob/main/INSTALL.md',
                label: 'Install',
            },
        ],
    },
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
        name: 'Al-Quran Quote',
        category: 'Rainmeter Skin',
        description:
            'A Rainmeter desktop skin for Windows that displays Al-Quran verses with their reference on a customizable panel, working offline from bundled verse data with optional live fetching from the quran.com API.',
        tech: ['Rainmeter', 'Lua'],
        repoURL: 'https://github.com/shibbirweb/rainmeter-skin-al-quran-quote',
        links: [
            {
                url: 'https://www.deviantart.com/shibbirweb/art/1360611014',
                label: 'DeviantArt',
            },
            {
                url: 'https://github.com/shibbirweb/rainmeter-skin-al-quran-quote/releases',
                label: 'Releases',
            },
            {
                url: 'https://github.com/shibbirweb/rainmeter-skin-al-quran-quote/wiki',
                label: 'Docs',
            },
        ],
    },
    {
        name: 'Advanced Laravel Vue Paginate',
        category: 'Vue.js Package',
        description:
            'A Vue.js pagination component that renders Laravel paginator responses out of the box, with a customizable, ready-to-use paginate UI.',
        tech: ['Vue.js', 'JavaScript', 'Laravel'],
        repoURL: 'https://github.com/shibbirweb/advanced-laravel-vue-paginate',
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

// Public repos built for personal use, learning, or practice. Mostly source
// only; `links` is for the few that also ship releases or docs.
export const personalProjects: Project[] = [
    {
        name: 'SendMock',
        category: 'Local Mock Server',
        description:
            'A local stand-in for the email, SMS, push notification and payment services an app talks to while you build and test it: the app sends over SMTP or the same Twilio, SendGrid, Stripe or FCM APIs it already uses, and SendMock keeps every message in a web UI, pulls out codes and links for tests, and sends realistic webhooks back, with a REST API, CLI and MCP server for AI agents.',
        tech: ['Rust', 'TypeScript', 'SMTP', 'MCP', 'Docker'],
        repoURL: 'https://github.com/shibbirweb/sendmock',
        links: [
            {
                url: 'https://shibbirweb.github.io/sendmock/',
                label: 'Website',
            },
            {
                url: 'https://shibbirweb.github.io/sendmock/demo/',
                label: 'Live demo',
            },
            {
                url: 'https://shibbirweb.github.io/sendmock/docs/',
                label: 'Docs',
            },
            {
                url: 'https://www.npmjs.com/package/sendmock',
                label: 'npm',
            },
            {
                url: 'https://hub.docker.com/r/shibbirweb/sendmock',
                label: 'Docker Hub',
            },
        ],
    },
    {
        name: 'Nibtree',
        category: 'Desktop Git Client',
        description:
            'A native desktop Git client for macOS, Windows and Linux with a 3-way merge tool, multi-folder workspaces, tabs, blame and history, plus a panel to run and watch AI coding agents such as Claude Code and Codex side by side in their own worktrees, built on Rust (Tauri 2) and Svelte 5 so it starts fast and stays light on memory.',
        tech: ['Rust', 'Tauri', 'Svelte', 'TypeScript', 'Git'],
        repoURL: 'https://github.com/shibbirweb/nibtree',
        links: [
            {
                url: 'https://github.com/shibbirweb/nibtree/releases',
                label: 'Releases',
            },
            {
                url: 'https://www.npmjs.com/package/nibtree',
                label: 'npm',
            },
            {
                url: 'https://hub.docker.com/r/shibbirweb/nibtree',
                label: 'Docker Hub',
            },
            {
                url: 'https://github.com/shibbirweb/nibtree/wiki',
                label: 'Docs',
            },
        ],
    },
    {
        name: 'On Air Record',
        category: 'Audio Broadcast & DVR',
        description:
            'A cross-platform audio broadcast and DVR service in Rust with a React control room UI: it captures a microphone on the host, streams it live to any browser on the local network, records continuously to disk, and lets you scrub back to any moment on a CCTV-style timeline.',
        tech: ['Rust', 'React', 'TypeScript', 'Docker'],
        repoURL: 'https://github.com/shibbirweb/on-air-record',
        links: [
            {
                url: 'https://hub.docker.com/r/shibbirweb/on-air-record',
                label: 'Docker Hub',
            },
            {
                url: 'https://github.com/shibbirweb/on-air-record/pkgs/container/on-air-record',
                label: 'GHCR',
            },
            {
                url: 'https://github.com/shibbirweb/on-air-record/releases',
                label: 'Releases',
            },
            {
                url: 'https://github.com/shibbirweb/on-air-record/wiki',
                label: 'Docs',
            },
        ],
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
    {
        name: 'Nginx Load Balancer',
        category: 'DevOps / Infrastructure',
        description:
            'An nginx-based load-balancing setup exploring traffic distribution across multiple upstream application instances.',
        tech: ['Nginx', 'JavaScript', 'Docker'],
        repoURL: 'https://github.com/shibbirweb/p-nginx-load-balancer',
    },
];
