import type { UsesSectionData } from '@/components/pages/uses/types';
import Cpu from '@/components/icons/cpu';
import Monitor from '@/components/icons/monitor';
import Keyboard from '@/components/icons/keyboard';
import Mouse from '@/components/icons/mouse';
import Speaker from '@/components/icons/speaker';
import Server from '@/components/icons/server';
import Cloud from '@/components/icons/cloud';
import Code from '@/components/icons/code';
import Bot from '@/components/icons/bot';
import Box from '@/components/icons/box';
import Wrench from '@/components/icons/wrench';

export const usesSections: UsesSectionData[] = [
    {
        title: 'Development Workstation',
        Icon: Cpu,
        intro: 'My primary machine for software development, AI experimentation, and gaming.',
        wide: true,
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
        Icon: Monitor,
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
        Icon: Keyboard,
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
        Icon: Mouse,
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
        Icon: Speaker,
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
        Icon: Server,
        intro: 'One of my favorite projects is my self-hosted home lab, where I experiment with infrastructure, networking, virtualization, automation, and self-hosting technologies.',
        wide: true,
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
        Icon: Cloud,
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
        title: 'Development',
        Icon: Code,
        wide: true,
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
        Icon: Bot,
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
        title: 'Infrastructure & DevOps',
        Icon: Box,
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
        title: 'Developer Tools',
        Icon: Wrench,
        wide: true,
        blocks: [
            {
                kind: 'tags',
                label: 'Editor',
                tags: ['Visual Studio Code', 'Cursor'],
            },
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
                label: 'Terminal',
                tags: ['Windows Terminal', 'PowerShell', 'WSL'],
            },
            {
                kind: 'tags',
                label: 'Browser',
                tags: ['Google Chrome', 'Firefox'],
            },
        ],
    },
];
