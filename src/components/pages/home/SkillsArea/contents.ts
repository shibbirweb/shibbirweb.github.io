import AiAgentsIcon from '@/components/icons/tech/ai-agents';
import AndroidStudioIcon from '@/components/icons/tech/android-studio';
import CaddyIcon from '@/components/icons/tech/caddy';
import CiCdIcon from '@/components/icons/tech/ci-cd';
import CloudflareIcon from '@/components/icons/tech/cloudflare';
import DockerIcon from '@/components/icons/tech/docker';
import EmbeddingsIcon from '@/components/icons/tech/embeddings';
import ExpressIcon from '@/components/icons/tech/express';
import FirebaseIcon from '@/components/icons/tech/firebase';
import GitIcon from '@/components/icons/tech/git';
import GitHubIcon from '@/components/icons/tech/github';
import GitHubActionsIcon from '@/components/icons/tech/github-actions';
import JavaIcon from '@/components/icons/tech/java';
import JavaScriptIcon from '@/components/icons/tech/javascript';
import KotlinIcon from '@/components/icons/tech/kotlin';
import LaravelIcon from '@/components/icons/tech/laravel';
import LinuxIcon from '@/components/icons/tech/linux';
import LlmIcon from '@/components/icons/tech/llm';
import McpIcon from '@/components/icons/tech/mcp';
import MySqlIcon from '@/components/icons/tech/mysql';
import N8nIcon from '@/components/icons/tech/n8n';
import NextJsIcon from '@/components/icons/tech/next-js';
import NginxIcon from '@/components/icons/tech/nginx';
import NodeJsIcon from '@/components/icons/tech/node-js';
import NuxtJsIcon from '@/components/icons/tech/nuxt-js';
import OpenClawIcon from '@/components/icons/tech/openclaw';
import PhpIcon from '@/components/icons/tech/php';
import PostgreSqlIcon from '@/components/icons/tech/postgresql';
import PrismaIcon from '@/components/icons/tech/prisma';
import ProxmoxIcon from '@/components/icons/tech/proxmox';
import QdrantIcon from '@/components/icons/tech/qdrant';
import RagIcon from '@/components/icons/tech/rag';
import ReactIcon from '@/components/icons/tech/react';
import RedisIcon from '@/components/icons/tech/redis';
import RestApiIcon from '@/components/icons/tech/rest-api';
import SqliteIcon from '@/components/icons/tech/sqlite';
import TailwindCssIcon from '@/components/icons/tech/tailwind-css';
import TypeScriptIcon from '@/components/icons/tech/typescript';
import VectorSearchIcon from '@/components/icons/tech/vector-search';
import ViteIcon from '@/components/icons/tech/vite';
import VueJsIcon from '@/components/icons/tech/vue-js';
import type { ComponentType, SVGProps } from 'react';

export type Skill = {
    name: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
    /**
     * Brand colour revealed on hover. Omit for logos that are monochrome by
     * brand (Next.js, Express, MCP, GitHub, Prisma) so they bloom to the theme
     * foreground and stay legible in both light and dark mode.
     */
    color?: string;
};

/**
 * Flat, ordered skill list rendered as icon + name cards. Kept in a sensible
 * reading order (languages, frontend, backend, data, infrastructure, AI,
 * version control) without visible group headings. Brand logos come from
 * simple-icons; the concept skills with no logo (REST APIs, LLMs, AI Agents,
 * RAG, Embeddings, Vector Search, CI/CD) use Lucide line icons.
 */
export const skills: Skill[] = [
    { name: 'Laravel', Icon: LaravelIcon, color: '#FF2D20' },
    { name: 'PHP', Icon: PhpIcon, color: '#777BB4' },
    { name: 'TypeScript', Icon: TypeScriptIcon, color: '#3178C6' },
    {
        name: 'JavaScript',
        Icon: JavaScriptIcon,
        // Brand yellow washes out on the light background, so use a deeper gold
        // in light mode and the bright brand yellow in dark mode.
        color: 'light-dark(#CA8A04, #F7DF1E)',
    },
    { name: 'React', Icon: ReactIcon, color: '#61DAFB' },
    { name: 'Next.js', Icon: NextJsIcon },
    { name: 'Vue.js', Icon: VueJsIcon, color: '#4FC08D' },
    { name: 'Nuxt.js', Icon: NuxtJsIcon, color: '#00DC82' },
    { name: 'Tailwind CSS', Icon: TailwindCssIcon, color: '#06B6D4' },
    { name: 'Vite', Icon: ViteIcon, color: '#646CFF' },
    { name: 'Node.js', Icon: NodeJsIcon, color: '#5FA04E' },
    { name: 'Express.js', Icon: ExpressIcon },
    { name: 'REST APIs', Icon: RestApiIcon, color: '#10B981' },
    { name: 'PostgreSQL', Icon: PostgreSqlIcon, color: '#4169E1' },
    { name: 'MySQL', Icon: MySqlIcon, color: '#4479A1' },
    {
        name: 'SQLite',
        Icon: SqliteIcon,
        // Brand navy is invisible in dark mode, so use it in light mode and a
        // lighter tint of the same blue in dark.
        color: 'light-dark(#003B57, #57A6DA)',
    },
    { name: 'Redis', Icon: RedisIcon, color: '#FF4438' },
    { name: 'Prisma', Icon: PrismaIcon },
    {
        name: 'Firebase',
        Icon: FirebaseIcon,
        // Amber washes out on the light background, so use a deeper orange in
        // light mode and the bright brand amber in dark mode.
        color: 'light-dark(#F57C00, #FFCA28)',
    },
    { name: 'Docker', Icon: DockerIcon, color: '#2496ED' },
    {
        name: 'Linux',
        Icon: LinuxIcon,
        // Same as JavaScript: a deeper gold in light mode, bright brand gold in dark.
        color: 'light-dark(#D08A00, #FCC624)',
    },
    { name: 'Nginx', Icon: NginxIcon, color: '#009639' },
    { name: 'Caddy', Icon: CaddyIcon, color: '#1F88C0' },
    { name: 'Cloudflare', Icon: CloudflareIcon, color: '#F38020' },
    { name: 'CI/CD', Icon: CiCdIcon, color: '#6366F1' },
    { name: 'Proxmox', Icon: ProxmoxIcon, color: '#E57000' },
    { name: 'LLMs', Icon: LlmIcon, color: '#8B5CF6' },
    { name: 'AI Agents', Icon: AiAgentsIcon, color: '#14B8A6' },
    { name: 'MCP', Icon: McpIcon },
    { name: 'RAG', Icon: RagIcon, color: '#F59E0B' },
    { name: 'Embeddings', Icon: EmbeddingsIcon, color: '#EC4899' },
    { name: 'Vector Search', Icon: VectorSearchIcon, color: '#0EA5E9' },
    { name: 'Qdrant', Icon: QdrantIcon, color: '#DC244C' },
    { name: 'OpenClaw', Icon: OpenClawIcon, color: '#F97316' },
    { name: 'n8n', Icon: N8nIcon, color: '#EA4B71' },
    { name: 'Git', Icon: GitIcon, color: '#F05032' },
    { name: 'GitHub', Icon: GitHubIcon },
    { name: 'GitHub Actions', Icon: GitHubActionsIcon, color: '#2088FF' },
    { name: 'Kotlin', Icon: KotlinIcon, color: '#7F52FF' },
    { name: 'Java', Icon: JavaIcon, color: '#0074BD' },
    { name: 'Android Studio', Icon: AndroidStudioIcon, color: '#3DDC84' },
];
