import type { ArticleStatus } from '@/lib/admin/types';

export type StatusFilter = 'all' | ArticleStatus;
export type SortKey = 'recent' | 'oldest' | 'title' | 'updated' | 'reading';
export type ViewMode = 'list' | 'grid';

export interface DashboardFilters {
    search: string;
    status: StatusFilter;
    category: string;
    tag: string;
    sort: SortKey;
}

export const DEFAULT_FILTERS: DashboardFilters = {
    search: '',
    status: 'all',
    category: 'all',
    tag: 'all',
    sort: 'recent',
};
