import CiCdIcon from '@/components/icons/tech/ci-cd';
import CloudflareIcon from '@/components/icons/tech/cloudflare';
import DockerIcon from '@/components/icons/tech/docker';
import EmbeddingsIcon from '@/components/icons/tech/embeddings';
import ExpressIcon from '@/components/icons/tech/express';
import JavaScriptIcon from '@/components/icons/tech/javascript';
import LaravelIcon from '@/components/icons/tech/laravel';
import LinuxIcon from '@/components/icons/tech/linux';
import LlmIcon from '@/components/icons/tech/llm';
import MySqlIcon from '@/components/icons/tech/mysql';
import NextJsIcon from '@/components/icons/tech/next-js';
import NginxIcon from '@/components/icons/tech/nginx';
import NodeJsIcon from '@/components/icons/tech/node-js';
import NuxtJsIcon from '@/components/icons/tech/nuxt-js';
import PhpIcon from '@/components/icons/tech/php';
import PostgreSqlIcon from '@/components/icons/tech/postgresql';
import ProxmoxIcon from '@/components/icons/tech/proxmox';
import QdrantIcon from '@/components/icons/tech/qdrant';
import RagIcon from '@/components/icons/tech/rag';
import ReactIcon from '@/components/icons/tech/react';
import RedisIcon from '@/components/icons/tech/redis';
import RestApiIcon from '@/components/icons/tech/rest-api';
import TailwindCssIcon from '@/components/icons/tech/tailwind-css';
import TypeScriptIcon from '@/components/icons/tech/typescript';
import VectorSearchIcon from '@/components/icons/tech/vector-search';
import VueJsIcon from '@/components/icons/tech/vue-js';
import type { ComponentType, SVGProps } from 'react';

export type Skill = {
    name: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
    /**
     * Brand colour revealed on hover. Omit for logos that are monochrome by
     * brand (Next.js, Express) so they bloom to the theme foreground and stay
     * legible in both light and dark mode.
     */
    color?: string;
};

/**
 * Flat, ordered skill list rendered as icon + name cards. Kept in a sensible
 * reading order (languages, backend, frontend, data, AI, infrastructure)
 * without visible group headings. Brand logos come from simple-icons; the
 * concept skills with no logo (REST APIs, LLMs, RAG, Embeddings, Vector Search,
 * CI/CD) use Lucide line icons.
 */
export const skills: Skill[] = [
    { name: 'TypeScript', Icon: TypeScriptIcon, color: '#3178C6' },
    {
        name: 'JavaScript',
        Icon: JavaScriptIcon,
        // Brand yellow washes out on the light background, so use a deeper gold
        // in light mode and the bright brand yellow in dark mode.
        color: 'light-dark(#CA8A04, #F7DF1E)',
    },
    { name: 'PHP', Icon: PhpIcon, color: '#777BB4' },
    { name: 'Laravel', Icon: LaravelIcon, color: '#FF2D20' },
    { name: 'Node.js', Icon: NodeJsIcon, color: '#5FA04E' },
    { name: 'Express.js', Icon: ExpressIcon },
    { name: 'REST APIs', Icon: RestApiIcon, color: '#10B981' },
    { name: 'React', Icon: ReactIcon, color: '#61DAFB' },
    { name: 'Next.js', Icon: NextJsIcon },
    { name: 'Vue.js', Icon: VueJsIcon, color: '#4FC08D' },
    { name: 'Nuxt.js', Icon: NuxtJsIcon, color: '#00DC82' },
    { name: 'Tailwind CSS', Icon: TailwindCssIcon, color: '#06B6D4' },
    { name: 'PostgreSQL', Icon: PostgreSqlIcon, color: '#4169E1' },
    { name: 'MySQL', Icon: MySqlIcon, color: '#4479A1' },
    { name: 'Redis', Icon: RedisIcon, color: '#FF4438' },
    { name: 'Qdrant', Icon: QdrantIcon, color: '#DC244C' },
    { name: 'LLMs', Icon: LlmIcon, color: '#8B5CF6' },
    { name: 'RAG', Icon: RagIcon, color: '#F59E0B' },
    { name: 'Embeddings', Icon: EmbeddingsIcon, color: '#EC4899' },
    { name: 'Vector Search', Icon: VectorSearchIcon, color: '#0EA5E9' },
    { name: 'Docker', Icon: DockerIcon, color: '#2496ED' },
    {
        name: 'Linux',
        Icon: LinuxIcon,
        // Same as JavaScript: a deeper gold in light mode, bright brand gold in dark.
        color: 'light-dark(#D08A00, #FCC624)',
    },
    { name: 'Proxmox', Icon: ProxmoxIcon, color: '#E57000' },
    { name: 'Nginx', Icon: NginxIcon, color: '#009639' },
    { name: 'Cloudflare', Icon: CloudflareIcon, color: '#F38020' },
    { name: 'CI/CD', Icon: CiCdIcon, color: '#6366F1' },
];
