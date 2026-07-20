import type { ExperienceEntry } from '@/components/pages/resume/types';
import BulletList from '@/components/pages/resume/BulletList';
import ExternalLink from '@/components/pages/resume/ExternalLink';
import MetaText from '@/components/pages/resume/MetaText';
import TechLine from '@/components/pages/resume/TechLine';

/** One company: name + location, then each role held there with its dates. */
export default function ExperienceItem({ entry }: { entry: ExperienceEntry }) {
    return (
        <div className="print:break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="text-[15px] font-bold print:text-[11.5pt]">
                    {entry.companyURL ? (
                        <ExternalLink
                            href={entry.companyURL}
                            className="hover:underline"
                        >
                            {entry.company}
                        </ExternalLink>
                    ) : (
                        entry.company
                    )}
                </h3>
                {entry.location && (
                    <MetaText className="tracking-wide uppercase">
                        {entry.location}
                    </MetaText>
                )}
            </div>

            <div className="mt-2.5 flex flex-col gap-4 print:mt-1.5 print:gap-3">
                {entry.positions.map((position) => (
                    <div key={`${position.role}-${position.period}`}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                            <p className="text-foreground font-semibold">
                                {position.role}
                                {position.promotedFrom &&
                                    position.promotedFrom.length > 0 && (
                                        <span className="text-foreground/70 font-normal">
                                            {' '}
                                            (promoted from{' '}
                                            <span className="print:hidden">
                                                {position.promotedFrom.join(
                                                    ' → '
                                                )}
                                            </span>
                                            <span className="hidden print:inline">
                                                {position.promotedFrom.join(
                                                    ', '
                                                )}
                                            </span>
                                            )
                                        </span>
                                    )}
                            </p>
                            <MetaText>{position.period}</MetaText>
                        </div>

                        {position.highlights &&
                            position.highlights.length > 0 && (
                                <BulletList
                                    items={position.highlights}
                                    className="mt-2 print:mt-1.5"
                                />
                            )}

                        {position.tech && position.tech.length > 0 && (
                            <TechLine tech={position.tech} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
