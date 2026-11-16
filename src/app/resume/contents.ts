import type {
    ContactLink,
    ResumeSectionData,
} from '@/components/pages/resume/types';
import {
    careerExperience,
    currentWorkplace,
    currentWorkplaceURL,
    educationURL,
    githubURL,
    linkedInURL,
    siteAuthorEmail,
    siteURL,
} from '@/config/constants';

// Name shown on the resume document (kept separate from the site-wide
// `siteName` used for branding/SEO).
export const resumeName = 'Md. Shibbir Ahmed';

// Headline under the name, on the page and in the printed PDF.
export const resumeHeadline =
    'Senior Full-Stack Software Engineer · Laravel, Vue.js, React · Claude API and MCP';

// Location + availability line under the contacts.
export const resumeLocation = 'Dhaka, Bangladesh (GMT+6)';

// Spoken languages, shown in the header under the location.
export const resumeLanguages = 'Bengali (native), English (professional)';

// Contact row under the name. Labels are the display text; hrefs are the real
// targets (mailto for email, canonical URLs for the rest).
export const resumeContacts: ContactLink[] = [
    { label: siteAuthorEmail, href: `mailto:${siteAuthorEmail}` },
    { label: 'linkedin.com/in/shibbirweb', href: linkedInURL },
    { label: 'github.com/shibbirweb', href: githubURL },
    { label: 'shibbir.me', href: siteURL },
];

// Ordered resume sections. This array IS the resume: reorder it to reorder the
// document, and append an entry (of an existing `kind`) to add a section with no
// component changes.
export const resumeSections: ResumeSectionData[] = [
    {
        kind: 'text',
        label: 'Summary',
        paragraphs: [
            `Senior full-stack engineer with ${careerExperience}+ years shipping web products in PHP/Laravel and modern JavaScript (Vue.js, Nuxt.js, React, Node.js, TypeScript). I own products end to end, from REST APIs and queue-based backends to the admin UI, and I lead a two-person engineering team.`,
            "I build AI products on the Anthropic Claude API and MCP (in-app assistants, custom MCP servers, tool calling) and brought Claude Code into my team's engineering workflow.",
        ],
    },
    {
        kind: 'experience',
        label: 'Experience',
        entries: [
            {
                company: currentWorkplace, // RoBenDevs
                companyURL: currentWorkplaceURL,
                location: 'Dhaka, Bangladesh',
                positions: [
                    {
                        role: 'Senior Software Engineer',
                        context:
                            'KP Dashboard, a US political advocacy platform · Leading a two-person team',
                        period: 'Oct 2024 - Present',
                        highlights: [
                            'Integrated 2 US congressional delivery systems (federal and state) routing constituent messages to legislators.',
                            'Built an in-app Claude assistant on a custom MCP server (7 legislator-data tools), plus 4 MCP developer tools.',
                            'Designed the Action Center subsystem end to end: 13 database tables, REST APIs and the full admin UI.',
                            'Sped up mass email 8x with a queue-based pipeline that recovers automatically.',
                            'Resolved 300+ production bugs from Sentry, including congressional delivery failures across 3 services.',
                            'Hardened public flows with Twilio SMS OTP, OAuth2, reCAPTCHA and SQL-injection fixes.',
                            'Named Top Performer twice (Feb 2025, Jul 2025).',
                        ],
                    },
                ],
            },
            {
                company: 'Media365 Limited',
                companyURL: 'https://media365.com.bd',
                location: 'Dhaka, Bangladesh',
                positions: [
                    {
                        role: 'Senior Full Stack Developer',
                        promotedFrom: ['Full Stack Developer'],
                        period: 'Mar 2023 - Oct 2024',
                        highlights: [
                            'Promoted to Senior within 11 months; named Best Web Engineer (Aug 2023).',
                            'Shipped Nuxt.js apps for healthcare users: DocTime (telehealth PWA) and Doctor PRO (prescription writing).',
                            'Built RateHammer, a buy-now, pay-later gateway with WooCommerce integration and JavaScript SDKs.',
                            'Set team UI standards and built reusable component libraries, cutting regression bugs and build time.',
                        ],
                    },
                ],
            },
            {
                company: 'MAXSOP',
                companyURL: 'https://www.maxsop.com',
                location: 'Mymensingh, Bangladesh',
                positions: [
                    {
                        role: 'Senior Software Engineer',
                        promotedFrom: [
                            'Intern',
                            'Junior Developer',
                            'Full Stack Developer',
                        ],
                        period: 'Oct 2018 - Feb 2023',
                        highlights: [
                            'Shipped Laravel and Vue.js apps end to end, from requirements to production.',
                            'Built Oporajito, an exam platform, owning its frontend, REST API, Android app and SSLCommerz payments.',
                        ],
                    },
                ],
            },
        ],
    },
    {
        kind: 'projects',
        label: 'Selected Open Source',
        layout: 'compact',
        entries: [
            {
                name: 'MCP DB Read-Only',
                tagline: 'Published npm package',
                highlights: [
                    'MCP server giving AI assistants safe, read-only access to 9 databases.',
                ],
                tech: ['TypeScript', 'MCP'],
                url: 'https://www.npmjs.com/package/@shibbirweb/mcp-db-read-only',
            },
            {
                name: 'CKEditor 5 Image Remove Event Callback Plugin',
                tagline: 'Published npm package',
                highlights: [
                    'Fires an event when an image is removed from CKEditor 5, letting apps clean up orphaned files on the server.',
                ],
                tech: ['JavaScript'],
                url: 'https://www.npmjs.com/package/ckeditor5-image-remove-event-callback-plugin',
            },
            {
                name: 'Advanced Laravel Vue Paginate',
                tagline: 'Published npm package',
                highlights: [
                    'Smart, highly customizable Vue pagination component for Laravel pagination.',
                ],
                tech: ['Vue.js', 'JavaScript'],
                url: 'https://www.npmjs.com/package/advanced-laravel-vue-paginate',
            },
        ],
    },
    {
        kind: 'skills',
        label: 'Skills',
        groups: [
            {
                label: 'Languages',
                values: ['PHP', 'JavaScript', 'TypeScript', 'SQL'],
            },
            {
                label: 'Backend',
                values: [
                    'Laravel',
                    'Livewire',
                    'Inertia.js',
                    'Node.js',
                    'Express',
                    'REST APIs',
                    'Queues (Horizon)',
                    'OAuth2',
                    'JWT',
                    'Socket.io',
                ],
            },
            {
                label: 'Frontend',
                values: [
                    'Vue.js',
                    'Nuxt.js',
                    'React',
                    'Next.js',
                    'Pinia',
                    'Vuex',
                    'Alpine.js',
                    'Tailwind CSS',
                ],
            },
            {
                label: 'Databases',
                values: [
                    'MySQL',
                    'PostgreSQL',
                    'SQLite',
                    'Redis',
                    'Prisma ORM',
                ],
            },
            {
                label: 'AI Engineering',
                values: [
                    'Claude API',
                    'MCP servers',
                    'Tool calling',
                    'LLM integration',
                    'Prompt engineering',
                    'Claude Code',
                ],
            },
            {
                label: 'Cloud and Tools',
                values: [
                    'Docker',
                    'AWS S3',
                    'CI/CD',
                    'Sentry',
                    'Git',
                    'GitHub',
                    'Jira',
                    'Mailgun',
                    'Twilio',
                ],
            },
            {
                label: 'Leadership',
                values: [
                    'Team leadership',
                    'End-to-end product ownership',
                    'UI development standards',
                ],
            },
        ],
    },
    {
        kind: 'education',
        label: 'Education',
        entries: [
            {
                institution: 'National University',
                institutionURL: educationURL,
                degree: 'B.Sc. (Honours) in Mathematics',
                year: '2019',
            },
        ],
    },
];
