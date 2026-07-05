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
        text: 'Senior Full-Stack Software Engineer with 7+ years building and scaling high-performance web applications. Deep experience in PHP/Laravel and modern JavaScript (Vue, Nuxt, React, Node/TypeScript), now focused on AI engineering with the Anthropic Claude API, MCP, and LLM-powered product features. Leads teams, owns systems end to end, and ships reliable production software.',
    },
    {
        kind: 'skills',
        label: 'Technical Skills',
        groups: [
            {
                label: 'Languages',
                values: ['PHP', 'JavaScript', 'TypeScript', 'SQL', 'Kotlin', 'Java'],
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
                    'Sanctum',
                    'OAuth2',
                    'JWT',
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
                values: ['MySQL', 'SQLite', 'Redis', 'Firebase', 'Prisma ORM'],
            },
            {
                label: 'AI',
                values: ['Anthropic Claude API', 'MCP', 'LLMs'],
            },
            {
                label: 'Cloud & Tools',
                values: [
                    'AWS S3',
                    'Docker',
                    'Twilio',
                    'Mailgun',
                    'Sentry',
                    'Capacitor (iOS)',
                    'WordPress',
                    'Git',
                    'Jira',
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
                            'Lead a team of 3 engineers while shipping 180+ features and fixes to production (55,000+ lines of code) across 5 applications in 21 months.',
                            'Integrated 2 US Communicating With Congress systems (HCWC federal, SCWC state), delivering constituent advocacy messages directly to legislator offices.',
                            'Engineered AI features on the Anthropic Claude API: an in-app assistant powered by a custom MCP server with 7 legislator-data tools, plus 4 internal MCP developer tools.',
                            'Fixed 300+ production bugs via Sentry monitoring, including congressional delivery failures resolved across 3 services; secured public flows with Twilio SMS OTP, OAuth2, reCAPTCHA v3/v2, and SQL injection remediation.',
                            "Launched the platform's iOS app (Capacitor 8) and drove App Store submission readiness.",
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
                companyURL: 'https://www.media365.com.bd',
                location: 'Dhaka, Bangladesh',
                positions: [
                    {
                        role: 'Senior Full Stack Developer',
                        period: 'Feb 2024 - Oct 2024',
                        highlights: [
                            'Built web applications with Nuxt.js and Vue (Vue CLI), writing efficient, optimized, testable, and reusable code.',
                            'Evaluated client specifications and project requirements, translating them into delivered features.',
                            'Owned UI page design and development standards; adapted and enhanced existing code.',
                            'Built internal snippets and tools to speed up team workflow and resolved new technical challenges as they arose.',
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
                    {
                        role: 'Full Stack Developer',
                        period: 'Mar 2023 - Jan 2024',
                        highlights: [
                            'Developed and maintained web application features across the stack.',
                            'Improved existing code and handled additional operational tasks as needed.',
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
                        role: 'Senior Web Developer',
                        period: 'Oct 2019 - Feb 2023',
                        highlights: [
                            'Developed web applications with PHP/Laravel and Vue.js (Vue CLI).',
                            'Analyzed client requirements and translated them into project deliverables.',
                            'Built efficient, optimized, testable, and reusable code.',
                            'Executed and monitored UI design and development standards.',
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
                    {
                        role: 'Web Developer, Internship',
                        period: 'Oct 2018 - Sep 2019',
                        highlights: [
                            'Assisted in building web application features and performed operational tasks as required.',
                        ],
                    },
                ],
            },
        ],
    },
    {
        kind: 'awards',
        label: 'Honors & Awards',
        entries: [
            { title: 'Top Performer', issuer: 'RoBenDevs', date: 'Jul 2025' },
            { title: 'Top Performer', issuer: 'RoBenDevs', date: 'Feb 2025' },
            {
                title: 'Best Web Engineer',
                issuer: 'Media365 Limited',
                date: 'Aug 2023',
            },
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
                    'Built background big-data pipelines (Laravel queues, Horizon): batch xlsx imports backed by S3, streamed chunked exports for the largest client datasets, and mass-message delivery with automatic recovery.',
                    'Eliminated N+1 patterns firing 100s of extra database queries per request and removed render-blocking JavaScript from the login page.',
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
                    'Contributed to a performant Progressive Web App for seamless cross-platform access.',
                    'Optimized frontend speed and responsiveness and hardened the platform against spam and abuse.',
                ],
                tech: ['Nuxt.js', 'Firebase Cloud Functions', 'Vuex', 'PWA'],
                url: 'https://doctime.com.bd',
            },
            {
                name: 'Doctor PRO',
                tagline: 'Prescription writing solution',
                company: 'Media365 Limited',
                highlights: [
                    'Built a user-friendly prescription-writing frontend with RESTful API integration.',
                    'Optimized medicine search with frontend caching and a smart suggestion system for faster selection.',
                ],
                tech: ['Laravel', 'Nuxt.js', 'Pinia'],
                url: 'https://www.doctorpro.doctime.com.bd/',
            },
            {
                name: 'RateHammer (Baskefy)',
                tagline: 'Buy-now, pay-later payment gateway',
                company: 'Media365 Limited',
                highlights: [
                    'Buy-now, pay-later gateway with seamless WordPress WooCommerce integration.',
                    'Built JavaScript SDKs to embed the payment gateway into other web platforms.',
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
                    'Bangladesh-based exam and practice platform for students and job seekers.',
                    'Delivered the frontend, the REST API backend, and the Android app.',
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
            {
                name: 'CKEditor 5 Image Remove Event Callback Plugin',
                tagline: 'Open source, npm package',
                highlights: [
                    'Fires an event when an image is removed from CKEditor 5, letting apps clean up orphaned files on the server.',
                ],
                tech: ['JavaScript'],
                url: 'https://www.npmjs.com/package/ckeditor5-image-remove-event-callback-plugin',
            },
            {
                name: 'Advanced Laravel Vue Paginate',
                tagline: 'Open source, npm package',
                highlights: [
                    'Smart, highly customizable Vue pagination component for Laravel pagination.',
                ],
                tech: ['Vue.js', 'JavaScript'],
                url: 'https://www.npmjs.com/package/advanced-laravel-vue-paginate',
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
