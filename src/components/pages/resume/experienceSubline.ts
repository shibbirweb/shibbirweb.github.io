import type {
    ExperienceEntry,
    ExperiencePosition,
} from '@/components/pages/resume/types';

/**
 * The secondary line under a role (on screen and in print): the role's context
 * (e.g. the product), the company location, then any earlier titles held there,
 * joined with a middot. Empty when there is none of them.
 */
export function experienceSubline(
    entry: ExperienceEntry,
    position: ExperiencePosition
): string {
    const parts: string[] = [];

    if (position.context) {
        parts.push(position.context);
    }

    if (entry.location) {
        parts.push(entry.location);
    }

    if (position.promotedFrom && position.promotedFrom.length > 0) {
        parts.push(`Promoted from ${position.promotedFrom.join(', ')}`);
    }

    return parts.join(' · ');
}
