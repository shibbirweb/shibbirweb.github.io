import type { ProjectEntry } from '@/components/pages/resume/types';
import OptionalExternalLink from '@/components/pages/resume/OptionalExternalLink';

/** One-line project: bold name, (stack), then its description. */
export default function PrintCompactProject({
    entry,
}: {
    entry: ProjectEntry;
}) {
    const description = (entry.highlights ?? []).join(' ');

    return (
        <>
            <OptionalExternalLink
                href={entry.url}
                className="font-bold text-neutral-900"
            >
                {entry.name}
            </OptionalExternalLink>
            {entry.tech &&
                entry.tech.length > 0 &&
                ` (${entry.tech.join(', ')})`}
            {description && `: ${description}`}
        </>
    );
}
