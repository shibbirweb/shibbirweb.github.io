import type { ProjectEntry } from '@/components/pages/resume/types';
import BulletList from '@/components/pages/resume/BulletList';
import ExternalLink from '@/components/pages/resume/ExternalLink';
import TechLine from '@/components/pages/resume/TechLine';

/** One project: name + tagline, optional bullets, optional tech line. */
export default function ProjectItem({ entry }: { entry: ProjectEntry }) {
    return (
        <div className="print:break-inside-avoid">
            <h3 className="text-[14px] font-bold print:text-[11pt]">
                {entry.url ? (
                    <ExternalLink
                        href={entry.url}
                        className="hover:underline"
                    >
                        {entry.name}
                    </ExternalLink>
                ) : (
                    entry.name
                )}
                {entry.tagline && (
                    <>
                        <span
                            aria-hidden="true"
                            className="text-foreground/55"
                        >
                            {' · '}
                        </span>
                        <span className="text-foreground/70 font-normal italic">
                            {entry.tagline}
                        </span>
                    </>
                )}
            </h3>

            {entry.company && (
                <p className="text-foreground/70 mt-0.5 text-[12px] font-medium print:text-[9pt]">
                    {entry.company}
                </p>
            )}

            {entry.highlights && entry.highlights.length > 0 && (
                <BulletList
                    items={entry.highlights}
                    className="mt-2"
                />
            )}

            {entry.tech && entry.tech.length > 0 && (
                <TechLine tech={entry.tech} />
            )}
        </div>
    );
}
