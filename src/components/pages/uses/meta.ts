import type { UsesGroup } from '@/components/pages/uses/types';

/** Human labels for the guide's parts, shown as entry eyebrows and in the index. */
export const groupLabels: Record<UsesGroup, string> = {
    machine: 'Machine',
    infra: 'Infrastructure',
    dev: 'Development',
};

/** Stable anchor id for a section, shared by the contents index and the entry. */
export function sectionId(title: string) {
    return title
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** Two-digit editorial number, e.g. 3 becomes "03". */
export function entryNumber(index: number) {
    return String(index + 1).padStart(2, '0');
}
