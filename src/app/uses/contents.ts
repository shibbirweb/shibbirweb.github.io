import type { UsesSectionData } from '@/components/pages/uses/types';

export const usesSections: UsesSectionData[] = [
    {
        title: 'Development Workstation',
        group: 'machine',
        intro: 'My primary machine for software development, AI experimentation, and gaming.',
        blocks: [
            {
                kind: 'specs',
                specs: [
                    { label: 'CPU', value: 'AMD Ryzen 7 7700 (8C/16T)' },
                    {
                        label: 'GPU',
                        value: 'ZOTAC GAMING GeForce RTX 5060 Ti 16GB Twin Edge',
                    },
                    {
                        label: 'Memory',
                        value: '32GB (2×16GB) Corsair VENGEANCE RGB DDR5 6000MHz',
                    },
                    {
                        label: 'Storage',
                        value: 'Lexar NM790 1TB PCIe Gen4 NVMe SSD',
                    },
                    {
                        label: 'Motherboard',
                        value: 'MSI B650M Gaming Plus WiFi',
                    },
                    {
                        label: 'CPU Cooler',
                        value: 'DeepCool ASSASSIN VC ELITE',
                    },
                    { label: 'Power Supply', value: 'Corsair CX750 750W' },
                    { label: 'Case', value: 'Gamdias ATHENA M3 ARGB' },
                ],
            },
        ],
    },
    {
        title: 'Displays',
        group: 'machine',
        blocks: [
            {
                kind: 'specs',
                specs: [
                    {
                        label: 'Primary',
                        value: 'LG 24GN65R-B, 23.8" IPS, 144Hz',
                    },
                    {
                        label: 'Secondary',
                        value: 'Xiaomi Redmi 1A, 23.8" IPS, 100Hz',
                    },
                ],
            },
        ],
    },
    {
        title: 'Keyboards',
        group: 'machine',
        blocks: [
            {
                kind: 'gear',
                gear: [
                    {
                        name: 'Keychron K7',
                        description:
                            'My daily driver for work. I love the low-profile design, portability, and comfortable typing experience during long development sessions.',
                    },
                    {
                        name: 'Royal Kludge R75',
                        description:
                            'My favorite compact mechanical keyboard when I want a traditional typing experience. The 75% layout, gasket mount, and hot-swappable switches make it enjoyable for both work and personal use.',
                    },
                ],
            },
        ],
    },
    {
        title: 'Mouse',
        group: 'machine',
        blocks: [
            {
                kind: 'gear',
                gear: [
                    {
                        name: 'Logitech MX Master 3S',
                        description:
                            "The best productivity mouse I've used. Excellent ergonomics, silent clicks, customizable buttons, and seamless multi-device support.",
                    },
                ],
            },
        ],
    },
    {
        title: 'Audio',
        group: 'machine',
        intro: 'Perfect for music while coding, online meetings, and watching technical talks.',
        blocks: [
            {
                kind: 'tags',
                tags: ['Edifier R1280DBs', 'Edifier T5 Subwoofer'],
            },
        ],
    },
    {
        title: 'Home Lab',
        group: 'infra',
        intro: 'One of my favorite projects is my self-hosted home lab, where I experiment with infrastructure, networking, virtualization, automation, and self-hosting technologies.',
        blocks: [
            {
                kind: 'specs',
                label: 'Server',
                specs: [
                    { label: 'CPU', value: 'AMD Ryzen 7 5700G' },
                    { label: 'Motherboard', value: 'MSI B450M-A PRO MAX II' },
                    {
                        label: 'Memory',
                        value: '32GB Corsair Vengeance LPX DDR4',
                    },
                    { label: 'Storage', value: '512GB NVMe SSD' },
                    { label: 'Cooler', value: 'DeepCool AG400' },
                ],
            },
            { kind: 'tags', label: 'Hypervisor', tags: ['Proxmox VE'] },
            {
                kind: 'tags',
                label: 'What I run',
                tags: [
                    'Docker',
                    'LXC Containers',
                    'Jellyfin',
                    'Radarr',
                    'Sonarr',
                    'Prowlarr',
                    'Bazarr',
                    'qBittorrent',
                    'SFTPGo',
                    'Pi-hole',
                    'Nginx Proxy Manager',
                    'WireGuard',
                    'WGDashboard',
                ],
            },
        ],
    },
    {
        title: 'Cloud Infrastructure',
        group: 'infra',
        intro: 'Alongside my home lab, I maintain a cloud server that hosts public-facing services and securely connects to my home network.',
        blocks: [
            {
                kind: 'tags',
                label: 'VPS',
                tags: ['Hostinger VPS', 'Ubuntu Server'],
            },
            {
                kind: 'tags',
                label: 'Running',
                tags: [
                    'Docker',
                    'Docker Compose',
                    'WireGuard VPN',
                    'Reverse Proxy',
                    'Cloudflare Tunnel',
                    'Personal APIs',
                    'Development environments',
                    'Self-hosted services',
                ],
            },
        ],
    },
    {
        title: 'Infrastructure & DevOps',
        group: 'infra',
        blocks: [
            {
                kind: 'tags',
                tags: [
                    'Docker',
                    'Docker Compose',
                    'Linux',
                    'Ubuntu Server',
                    'Proxmox VE',
                    'Cloudflare',
                    'Nginx',
                    'Caddy',
                    'WireGuard',
                    'Git',
                    'GitHub',
                    'SSH',
                    'DNS Management',
                    'Reverse Proxy',
                    'SSL/TLS',
                ],
            },
        ],
    },
    {
        title: 'Development',
        group: 'dev',
        blocks: [
            {
                kind: 'tags',
                label: 'Languages',
                tags: [
                    'PHP',
                    'TypeScript',
                    'JavaScript (ES6+)',
                    'SQL',
                    'Java',
                    'Kotlin',
                ],
            },
            {
                kind: 'tags',
                label: 'Frameworks',
                tags: [
                    'Laravel',
                    'Next.js',
                    'React',
                    'Vue.js',
                    'Nuxt.js',
                    'Express.js',
                ],
            },
            {
                kind: 'tags',
                label: 'Databases',
                tags: [
                    'PostgreSQL',
                    'MySQL',
                    'SQLite',
                    'Firebase Firestore',
                    'Redis',
                    'Qdrant (Vector Database)',
                ],
            },
        ],
    },
    {
        title: 'AI',
        group: 'dev',
        intro: 'AI has become part of my daily development workflow.',
        blocks: [
            {
                kind: 'tags',
                label: 'I use',
                tags: ['ChatGPT', 'Claude Code', 'Google Gemini'],
            },
            {
                kind: 'tags',
                label: 'Mostly for',
                tags: [
                    'Architecture discussions',
                    'Brainstorming',
                    'Documentation',
                    'Refactoring',
                    'Code reviews',
                    'Debugging',
                    'Learning new technologies',
                    'Rapid prototyping',
                ],
            },
        ],
    },
    {
        title: 'Developer Tools',
        group: 'dev',
        blocks: [
            {
                kind: 'tags',
                label: 'API testing',
                tags: ['Postman', 'Bruno', 'Requestly'],
            },
            {
                kind: 'tags',
                label: 'Package managers',
                tags: ['npm', 'pnpm', 'Composer'],
            },
            {
                kind: 'tags',
                label: 'Version control',
                tags: ['Git', 'GitHub', 'GitLab', 'Bitbucket'],
            },
            {
                kind: 'tags',
                label: 'Browser',
                tags: ['Google Chrome', 'Firefox'],
            },
        ],
    },
    {
        title: 'Editor Setup',
        group: 'dev',
        // TODO: These extensions, settings, keybindings, theme and fonts are
        // placeholders. Replace them with your real VS Code setup.
        intro: 'Where I spend most of the day. My editor, the extensions I keep installed, and the settings and keybindings I carry between machines.',
        blocks: [
            {
                kind: 'extensions',
                label: 'Extensions',
                extensions: [
                    {
                        name: 'GitLens',
                        publisher: 'eamodio',
                        itemName: 'eamodio.gitlens',
                        description:
                            'Inline blame and history so I can see who changed a line and why, without leaving the file.',
                    },
                    {
                        name: 'Prettier',
                        publisher: 'esbenp',
                        itemName: 'esbenp.prettier-vscode',
                        description:
                            'Opinionated formatting on save so diffs stay about logic, not whitespace.',
                    },
                    {
                        name: 'ESLint',
                        publisher: 'dbaeumer',
                        itemName: 'dbaeumer.vscode-eslint',
                        description:
                            'Catches lint problems as I type instead of at CI time.',
                    },
                    {
                        name: 'Tailwind CSS IntelliSense',
                        publisher: 'bradlc',
                        itemName: 'bradlc.vscode-tailwindcss',
                        description:
                            'Class name completion and hover previews for Tailwind projects.',
                    },
                    {
                        name: 'Error Lens',
                        publisher: 'usernamehw',
                        itemName: 'usernamehw.errorlens',
                        description:
                            'Surfaces diagnostics inline at the end of the line for faster triage.',
                    },
                    {
                        name: 'Docker',
                        publisher: 'ms-azuretools',
                        itemName: 'ms-azuretools.vscode-docker',
                        description:
                            'Manage containers, images, and Compose files from the editor.',
                    },
                ],
            },
            {
                kind: 'specs',
                label: 'Theme & fonts',
                specs: [
                    { label: 'Color theme', value: 'Default Dark Modern' },
                    { label: 'Icon theme', value: 'Material Icon Theme' },
                    { label: 'Editor font', value: 'JetBrains Mono' },
                ],
            },
            {
                kind: 'link',
                label: 'Config',
                title: 'settings.json & keybindings.json',
                // TODO: Replace with the real gist id for your VS Code settings.
                href: 'https://gist.github.com/shibbirweb/REPLACE_WITH_GIST_ID',
                description:
                    'My full editor settings and keybindings, kept in a gist so they stay current.',
            },
        ],
    },
    {
        title: 'Terminal & Dotfiles',
        group: 'dev',
        // TODO: Placeholder shell setup and aliases. Swap in your real dotfiles.
        intro: 'The shell I live in and a few aliases that save keystrokes.',
        blocks: [
            {
                kind: 'specs',
                specs: [
                    { label: 'Terminal', value: 'Windows Terminal' },
                    { label: 'Shell', value: 'PowerShell / bash (WSL2)' },
                    { label: 'Prompt', value: 'Starship' },
                    { label: 'Font', value: 'JetBrainsMono Nerd Font' },
                ],
            },
            {
                kind: 'link',
                label: 'Dotfiles',
                title: 'shell config & aliases',
                // TODO: Replace with the real gist id for your dotfiles.
                href: 'https://gist.github.com/shibbirweb/REPLACE_WITH_GIST_ID',
                description:
                    'My prompt, aliases, and shell tweaks, in a gist you can skim or clone.',
            },
        ],
    },
];
