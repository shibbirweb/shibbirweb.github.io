import type { NowSectionData } from '@/components/pages/now/types';

export const nowMeta = {
    title: "What I'm Doing Now",
    subtitle:
        "A snapshot of what I'm currently building, learning, and focusing on.",
    lastUpdated: 'June 2026',
};

export const nowSections: NowSectionData[] = [
    {
        title: 'Work',
        emoji: '👨‍💻',
        intro: 'Currently working as a Senior Software Engineer, building scalable web applications and backend systems. My daily work focuses on:',
        blocks: [
            {
                kind: 'tags',
                tags: [
                    'Backend architecture',
                    'API development',
                    'Database optimization',
                    'Performance improvements',
                    'Code quality',
                    'Solving challenging engineering problems',
                ],
            },
        ],
    },
    {
        title: 'Building',
        emoji: '🤖',
        intro: 'Exploring practical AI applications. Current interests:',
        wide: true,
        blocks: [
            {
                kind: 'tags',
                tags: [
                    'Large Language Models (LLMs)',
                    'Agentic AI',
                    'Retrieval-Augmented Generation (RAG)',
                    'Model Context Protocol (MCP)',
                    'Prompt Engineering',
                    'Embeddings',
                    'AI-assisted development',
                ],
            },
        ],
    },
    {
        title: 'Learning',
        emoji: '📚',
        intro: "I'm currently investing time in becoming a stronger backend engineer. Topics I'm studying:",
        blocks: [
            {
                kind: 'tags',
                tags: [
                    'System Design',
                    'Distributed Systems',
                    'PostgreSQL Performance',
                    'Kubernetes',
                    'Event-Driven Architecture',
                    'Software Architecture',
                    'Scalable Backend Systems',
                ],
            },
        ],
    },
    {
        title: 'Home Lab',
        emoji: '🏠',
        intro: "I'm constantly experimenting with my self-hosted infrastructure. Current playground:",
        outro: 'I enjoy building infrastructure almost as much as building applications.',
        wide: true,
        blocks: [
            {
                kind: 'tags',
                tags: [
                    'Proxmox',
                    'Docker',
                    'LXC Containers',
                    'Networking',
                    'WireGuard',
                    'Reverse Proxies',
                    'Cloud Infrastructure',
                ],
            },
        ],
    },
    {
        title: 'Writing',
        emoji: '📝',
        intro: 'Working on documenting what I learn. Topics I want to write about:',
        blocks: [
            {
                kind: 'tags',
                tags: [
                    'Backend Engineering',
                    'AI Development',
                    'Docker',
                    'Home Lab',
                    'Laravel',
                    'Next.js',
                    'System Design',
                    'Lessons learned from real-world projects',
                ],
            },
        ],
    },
    {
        title: 'Reading',
        emoji: '📖',
        intro: 'Books currently on my reading list:',
        blocks: [
            {
                kind: 'list',
                items: [
                    'Designing Data-Intensive Applications',
                    'Clean Architecture',
                    'System Design Interview',
                    'Refactoring',
                ],
            },
        ],
    },
    {
        title: 'Goals',
        emoji: '🎯',
        intro: 'Current goals include:',
        blocks: [
            {
                kind: 'list',
                items: [
                    'Become a world-class backend engineer',
                    'Master system design',
                    'Build production-ready AI applications',
                    'Contribute more to open source',
                    'Write consistently',
                    'Keep learning every day',
                ],
            },
        ],
    },
];

export const nowQuote = 'The best engineers never stop learning.';
