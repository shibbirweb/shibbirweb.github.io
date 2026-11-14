export type Skill = {
    name: string;
    /**
     * Logo file name (without `.svg`) in public/icons/skills/. The logo is
     * drawn as a CSS mask, so its colours are ignored: only its shape is used.
     */
    icon: string;
    /**
     * Brand colour revealed on hover. Omit for logos that are monochrome by
     * brand (Next.js, Express, MCP, GitHub, Prisma, OpenAI, Ollama) so they
     * bloom to the theme foreground and stay legible in both light and dark mode.
     */
    color?: string;
};

/** A headline AI skill, shown as a large card with a one-line summary. */
export type FeaturedSkill = Skill & {
    summary: string;
};

/** A labelled row of the supporting stack (e.g. "Frontend"). */
export type SkillGroup = {
    title: string;
    skills: Skill[];
};

/** Folder (under public/) holding one `<icon>.svg` logo per skill. */
export const skillIconDirectory = '/icons/skills';

/** The site path of a skill's logo file. */
export function skillIconUrl(icon: string): string {
    return `${skillIconDirectory}/${icon}.svg`;
}

export const skillsIntro =
    'AI engineering first, on a full-stack foundation that ships it.';

export const aiShowcaseTitle = 'AI Engineering';

export const aiShowcaseBadge = 'Core focus';

export const aiToolkitTitle = 'Models, retrieval & automation';

export const stackOverviewTitle = 'Full-stack foundation';

/**
 * The four AI skills the section leads with, each as a card with a summary.
 * Brand logos in public/icons/skills/ come from simple-icons; the concept
 * skills with no logo use Lucide line icons.
 */
export const featuredAiSkills: FeaturedSkill[] = [
    {
        name: 'LLMs',
        icon: 'llm',
        color: '#8B5CF6',
        summary:
            'Putting models to work inside real products: prompts, structured output and streaming.',
    },
    {
        name: 'AI Agents',
        icon: 'ai-agents',
        color: '#14B8A6',
        summary:
            'Tool-calling agents that plan a task, act on it and report back.',
    },
    {
        name: 'MCP',
        icon: 'mcp',
        summary:
            'Servers that expose apps, data and workflows to AI clients as tools.',
    },
    {
        name: 'RAG',
        icon: 'rag',
        color: '#F59E0B',
        summary:
            'Retrieval pipelines that ground answers in your own documents.',
    },
];

/** The rest of the AI toolkit, shown as chips under the featured cards. */
export const aiToolkit: Skill[] = [
    { name: 'Claude', icon: 'claude', color: '#D97757' },
    { name: 'OpenAI', icon: 'openai' },
    { name: 'Ollama', icon: 'ollama' },
    { name: 'Embeddings', icon: 'embeddings', color: '#EC4899' },
    { name: 'Vector Search', icon: 'vector-search', color: '#0EA5E9' },
    { name: 'Qdrant', icon: 'qdrant', color: '#DC244C' },
    { name: 'OpenClaw', icon: 'openclaw', color: '#F97316' },
    { name: 'n8n', icon: 'n8n', color: '#EA4B71' },
];

/**
 * The supporting stack, one labelled row per layer, in reading order from
 * languages down to tooling.
 */
export const stackGroups: SkillGroup[] = [
    {
        title: 'Languages',
        skills: [
            { name: 'TypeScript', icon: 'typescript', color: '#3178C6' },
            {
                name: 'JavaScript',
                icon: 'javascript',
                // Brand yellow washes out on the light background, so use a
                // deeper gold in light mode and the bright brand yellow in dark.
                color: 'light-dark(#CA8A04, #F7DF1E)',
            },
            { name: 'PHP', icon: 'php', color: '#777BB4' },
            { name: 'Kotlin', icon: 'kotlin', color: '#7F52FF' },
            { name: 'Java', icon: 'java', color: '#0074BD' },
        ],
    },
    {
        title: 'Frontend',
        skills: [
            { name: 'React', icon: 'react', color: '#61DAFB' },
            { name: 'Next.js', icon: 'next-js' },
            { name: 'Vue.js', icon: 'vue-js', color: '#4FC08D' },
            { name: 'Nuxt.js', icon: 'nuxt-js', color: '#00DC82' },
            { name: 'Tailwind CSS', icon: 'tailwind-css', color: '#06B6D4' },
            { name: 'Vite', icon: 'vite', color: '#646CFF' },
        ],
    },
    {
        title: 'Backend',
        skills: [
            { name: 'Laravel', icon: 'laravel', color: '#FF2D20' },
            { name: 'Node.js', icon: 'node-js', color: '#5FA04E' },
            { name: 'Express.js', icon: 'express' },
            { name: 'REST APIs', icon: 'rest-api', color: '#10B981' },
            { name: 'WordPress', icon: 'wordpress', color: '#21759B' },
        ],
    },
    {
        title: 'Data',
        skills: [
            { name: 'PostgreSQL', icon: 'postgresql', color: '#4169E1' },
            { name: 'MySQL', icon: 'mysql', color: '#4479A1' },
            {
                name: 'SQLite',
                icon: 'sqlite',
                // Brand navy is invisible in dark mode, so use it in light mode
                // and a lighter tint of the same blue in dark.
                color: 'light-dark(#003B57, #57A6DA)',
            },
            { name: 'Redis', icon: 'redis', color: '#FF4438' },
            { name: 'Prisma', icon: 'prisma' },
            {
                name: 'Firebase',
                icon: 'firebase',
                // Amber washes out on the light background, so use a deeper
                // orange in light mode and the bright brand amber in dark.
                color: 'light-dark(#F57C00, #FFCA28)',
            },
        ],
    },
    {
        title: 'Infrastructure',
        skills: [
            { name: 'Docker', icon: 'docker', color: '#2496ED' },
            {
                name: 'Linux',
                icon: 'linux',
                // Same as JavaScript: a deeper gold in light mode, bright brand
                // gold in dark.
                color: 'light-dark(#D08A00, #FCC624)',
            },
            { name: 'Nginx', icon: 'nginx', color: '#009639' },
            { name: 'Caddy', icon: 'caddy', color: '#1F88C0' },
            { name: 'Cloudflare', icon: 'cloudflare', color: '#F38020' },
            { name: 'Proxmox', icon: 'proxmox', color: '#E57000' },
            { name: 'CI/CD', icon: 'ci-cd', color: '#6366F1' },
        ],
    },
    {
        title: 'Tooling & mobile',
        skills: [
            { name: 'Git', icon: 'git', color: '#F05032' },
            { name: 'GitHub', icon: 'github' },
            {
                name: 'GitHub Actions',
                icon: 'github-actions',
                color: '#2088FF',
            },
            {
                name: 'Android Studio',
                icon: 'android-studio',
                color: '#3DDC84',
            },
        ],
    },
];

/** Every skill in the section, featured cards first, for content checks. */
export const allSkills: Skill[] = [
    ...featuredAiSkills,
    ...aiToolkit,
    ...stackGroups.flatMap((group) => group.skills),
];
