import type { UsesSectionData } from '@/components/pages/uses/types';
import UsesBlock from '@/components/pages/uses/UsesBlock';
import { groupLabels } from '@/components/pages/uses/meta';

/**
 * One entry in the guide, laid out as an editorial spread: a pinned left column
 * carrying the large ghosted number, the part eyebrow, the display title, and a
 * short standfirst; the right column holds the section's content blocks. The
 * left column sticks while the content scrolls, giving the long page rhythm
 * without any client-side code.
 */
export default function GearGuideEntry({
    section,
    id,
    number,
}: {
    section: UsesSectionData;
    id: string;
    number: string;
}) {
    return (
        <section
            id={id}
            className="border-foreground/15 grid scroll-mt-24 gap-x-10 gap-y-6 border-t pt-8 sm:pt-12 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
        >
            <div className="md:sticky md:top-24 md:self-start">
                <div className="flex items-baseline gap-3">
                    <span className="text-foreground/15 font-mono text-4xl leading-none font-bold tabular-nums sm:text-6xl">
                        {number}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.2em] text-emerald-600 uppercase dark:text-emerald-400">
                        {groupLabels[section.group]}
                    </span>
                </div>

                <h2 className="font-display mt-4 text-3xl leading-[1.1] font-bold sm:text-4xl">
                    {section.title}
                </h2>

                {section.intro && (
                    <p className="text-foreground/60 mt-3 max-w-xs text-sm leading-relaxed">
                        {section.intro}
                    </p>
                )}
            </div>

            <div className="flex min-w-0 flex-col gap-7 md:pt-1">
                {section.blocks.map((block, index) => (
                    <UsesBlock
                        key={`${block.kind}-${index}`}
                        block={block}
                    />
                ))}
            </div>
        </section>
    );
}
