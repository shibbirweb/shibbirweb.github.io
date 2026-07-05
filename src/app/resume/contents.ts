import type {
    ContactLink,
    ResumeSectionData,
} from '@/components/pages/resume/types';
import {
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

// Location + availability line under the contacts.
export const resumeLocation = 'Dhaka, Bangladesh (GMT+6)';

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
        text: 'Senior Full-Stack Software Engineer with 6+ years shipping scalable, high-performance web applications in PHP/Laravel and modern JavaScript (Vue, Nuxt, React, Node/TypeScript). Leads engineering teams, owns products end to end, and designs REST APIs, queue-based pipelines, and event-driven backends. Currently building AI products on the Anthropic Claude API and MCP: in-app assistants, custom MCP servers, and tool/function calling. Focused on system design, performance, and reliable delivery.',
    },
    {
        kind: 'skills',
        label: 'Technical Skills',
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
                    'Queue Processing (Horizon)',
                    'Sanctum',
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
                    'Vuex',
                    'Pinia',
                    'Alpine.js',
                    'jQuery',
                    'Tailwind CSS',
                ],
            },
            {
                label: 'Databases',
                values: ['MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'Prisma ORM'],
            },
            {
                label: 'AI',
                values: [
                    'Anthropic Claude API',
                    'MCP (Model Context Protocol)',
                    'LLM Integration',
                    'Prompt Engineering',
                    'Tool / Function Calling',
                ],
            },
            {
                label: 'DevOps & Cloud',
                values: ['Docker', 'AWS S3', 'CI/CD', 'Sentry', 'Git'],
            },
            {
                label: 'Tools',
                values: [
                    'GitHub',
                    'Jira',
                    'Agile',
                    'Capacitor (iOS)',
                    'Mailgun',
                    'Twilio',
                    'reCAPTCHA',
                    'WordPress',
                ],
            },
        ],
    },
    {
        kind: 'experience',
        label: 'Work Experience',
        entries: [
            {
                company: currentWorkplace, // RoBenDevs
                companyURL: currentWorkplaceURL,
                location: 'Dhaka, Bangladesh',
                positions: [
                    {
                        role: 'Senior Software Engineer',
                        period: 'Oct 2024 - Present',
                        highlights: [
                            'Led a team of 3 engineers, shipping 180+ production features and fixes (55,000+ lines of code) across 5 applications in 21 months.',
                            'Integrated 2 US Communicating-With-Congress delivery systems (federal and state) to route constituent advocacy messages directly to legislator offices.',
                            'Built AI features on the Anthropic Claude API: an in-app assistant backed by a custom MCP server exposing 7 legislator-data tools, plus 4 internal MCP developer tools.',
                            'Resolved 300+ production bugs via Sentry monitoring, including congressional delivery failures fixed across 3 services.',
                            'Hardened public-facing flows with Twilio SMS OTP, OAuth2, reCAPTCHA v3/v2, and SQL-injection remediation.',
                            'Launched the platform iOS app with Capacitor 8 and drove App Store submission readiness.',
                        ],
                        tech: [
                            'PHP (Laravel)',
                            'MySQL',
                            'Redis',
                            'Node.js (Express, TypeScript, TypeORM)',
                            'Vue 2 (Vuex, Vuetify)',
                            'React 18 (Redux Toolkit, RTK Query, Tailwind)',
                            'REST APIs',
                            'OAuth2',
                            'JWT',
                            'Socket.io',
                            'Capacitor (iOS)',
                            'Anthropic Claude API',
                            'MCP',
                            'AWS S3',
                            'Mailgun',
                            'Twilio',
                            'reCAPTCHA',
                            'Sentry',
                            'Git',
                            'Jira',
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
                            'Promoted to Senior within 11 months after delivering client-facing features across the product.',
                            'Shipped client-facing Nuxt.js/Vue applications serving healthcare users in emerging markets, including a telehealth PWA and a prescription-writing platform.',
                            'Refactored legacy frontend code and established UI development standards adopted across the team, reducing regression bugs in client deliveries.',
                            'Built internal tooling and reusable component libraries that cut feature build time for the team.',
                        ],
                        tech: [
                            'Nuxt.js',
                            'Vue.js',
                            'PHP',
                            'Laravel',
                            'JavaScript',
                            'MySQL',
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
                            'Progressed from intern to Senior Software Engineer over 4+ years through three promotions.',
                            'Built and shipped PHP/Laravel and Vue.js applications from requirements through production delivery, including Oporajito, an online exam platform (web and Android) with SSLCommerz payment integration.',
                            'Established and monitored UI design and development standards for the team.',
                        ],
                        tech: [
                            'PHP',
                            'Laravel',
                            'Vue.js',
                            'JavaScript',
                            'MySQL',
                            'Git',
                        ],
                    },
                ],
            },
        ],
    },
    {
        kind: 'bullets',
        label: 'AI Experience',
        items: [
            'Designed the tool schema and data-access layer for a custom MCP server (7 legislator-data tools plus 4 internal developer tools), covering tool and function calling end to end.',
            'Built prompt pipelines and LLM integration surfacing domain data through natural-language queries, including structured output handling and error recovery.',
            "Integrated AI-assisted developer tooling (Claude Code) into the team's engineering workflow.",
        ],
    },
    {
        kind: 'projects',
        label: 'Projects',
        entries: [
            {
                name: 'KP Dashboard',
                tagline: 'Political influence and advocacy platform',
                company: 'RoBenDevs',
                highlights: [
                    'Designed the Action Center engagement subsystem end to end: 13 database tables, REST APIs, and the full admin UI.',
                    'Increased email sending throughput 8x with a queue-based mass-message pipeline (automatic recovery), significantly cutting delivery time.',
                    'Built background big-data pipelines (Laravel queues, Horizon): batch xlsx imports backed by S3 and streamed chunked exports for the largest client datasets.',
                    'Eliminated N+1 query patterns firing 100s of extra database queries per request and removed render-blocking JavaScript from the login page.',
                ],
                tech: [
                    'Laravel',
                    'MySQL',
                    'Redis',
                    'Vue 2',
                    'React 18',
                    'Node.js (Express)',
                    'AWS S3',
                    'REST APIs',
                ],
            },
            {
                name: 'DocTime',
                tagline: 'Telehealth consultation PWA',
                company: 'Media365 Limited',
                highlights: [
                    'Built a performant Progressive Web App (PWA) for cross-platform telehealth consultations in emerging markets.',
                    'Optimized frontend performance and responsiveness and implemented anti-spam and platform-integrity safeguards.',
                ],
                tech: ['Nuxt.js', 'Firebase Cloud Functions', 'Vuex', 'PWA'],
                url: 'https://doctime.com.bd',
            },
            {
                name: 'Doctor PRO',
                tagline: 'Prescription writing solution',
                company: 'Media365 Limited',
                highlights: [
                    'Engineered a prescription-writing interface with RESTful API integration and frontend caching.',
                    'Designed a smart medicine-suggestion system and optimized search for faster clinician workflows.',
                ],
                tech: ['Laravel', 'Nuxt.js', 'Pinia'],
                url: 'https://www.doctorpro.doctime.com.bd/',
            },
            {
                name: 'RateHammer (Baskefy)',
                tagline: 'Buy-now, pay-later payment gateway',
                company: 'Media365 Limited',
                highlights: [
                    'Built a buy-now, pay-later payment gateway with seamless WordPress WooCommerce integration.',
                    'Developed JavaScript SDKs enabling third-party platforms to embed the gateway.',
                ],
                tech: [
                    'TypeScript',
                    'Nuxt.js',
                    'Pinia',
                    'Tailwind CSS',
                    'PHP',
                    'WordPress',
                ],
            },
            {
                name: 'Oporajito',
                tagline: 'Online exam and practice platform (Web + Android)',
                company: 'MAXSOP',
                highlights: [
                    'Delivered an online exam and practice platform (web and Android) for students and job seekers.',
                    'Owned the frontend, the REST API backend, and the native Android app, with SSLCommerz payment integration.',
                ],
                tech: [
                    'PHP',
                    'Laravel',
                    'Sanctum',
                    'Vue.js',
                    'Livewire',
                    'Alpine.js',
                    'MySQL',
                    'SSLCommerz',
                ],
            },
        ],
    },
    {
        kind: 'projects',
        label: 'Open Source',
        entries: [
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
        kind: 'awards',
        label: 'Honors & Awards',
        entries: [
            {
                title: 'Top Performer',
                issuer: 'RoBenDevs',
                date: 'Feb 2025, Jul 2025',
            },
            {
                title: 'Best Web Engineer',
                issuer: 'Media365 Limited',
                date: 'Aug 2023',
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
            {
                institution: 'Altaf Golandaz College',
                degree: 'Higher Secondary Certificate (HSC)',
                year: '2014',
            },
            {
                institution: 'Islamia Government High School',
                degree: 'Secondary School Certificate (SSC)',
                year: '2012',
            },
        ],
    },
    {
        kind: 'text',
        label: 'Languages',
        text: 'Bengali (Native), English (Professional)',
    },
];
