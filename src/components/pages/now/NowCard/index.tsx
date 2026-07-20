import type { CSSProperties } from 'react';
import type { NowSectionData } from '@/components/pages/now/types';
import NowBlock from '@/components/pages/now/NowBlock';
import styles from '@/components/pages/now/NowCard/NowCard.module.css';
import { cn } from '@/utils/cn';

/**
 * A single /now section rendered as a snapshot card, the sibling of the /uses
 * catalog entry (UsesCard): a monospace index in the corner, an accent-tinted
 * icon badge and title, an optional intro, the section's content blocks, then an
 * optional closing outro. Each card is given its own accent hue derived from its
 * position with the golden angle, so consecutive cards land far apart on the
 * colour wheel and any section added to contents.ts gets a distinct accent
 * automatically. The hue drives the signature bloom and the badge tint (both in
 * NowCard.module.css). Wide, content-heavy sections span two columns in the grid.
 * Rendered as an <li> inside the <ul>.
 */
export default function NowCard({
    section,
    index,
}: {
    section: NowSectionData;
    index: number;
}) {
    const hue = (index * 137.508) % 360;
    const accent = {
        '--card-accent': `oklch(0.72 0.16 ${hue})`,
    } as CSSProperties;
    const catalogNumber = String(index + 1).padStart(2, '0');

    return (
        <li
            style={accent}
            className={cn(
                styles.card,
                'group border-foreground/10 hover:border-foreground/25 relative isolate flex h-full flex-col rounded-2xl border p-6 transition-[border-color,box-shadow] duration-300 hover:shadow-lg sm:p-8',
                section.wide && 'md:col-span-2'
            )}
        >
            <span
                aria-hidden="true"
                className="text-foreground/25 group-hover:text-foreground/60 absolute top-5 right-6 font-mono text-xs tracking-widest transition-colors duration-300 sm:top-6"
            >
                {catalogNumber}
            </span>

            <div className="flex items-center gap-3.5 pr-8">
                <span className={styles.badge}>
                    <section.Icon
                        aria-hidden="true"
                        className="text-foreground/80 size-5"
                    />
                </span>
                <h2 className="text-lg font-bold sm:text-xl">
                    {section.title}
                </h2>
            </div>

            {section.intro && (
                <p className="text-foreground/70 mt-4 text-sm leading-relaxed">
                    {section.intro}
                </p>
            )}

            <div className="mt-5 flex grow flex-col gap-6">
                {section.blocks.map((block, blockIndex) => (
                    <NowBlock
                        key={`${block.kind}-${blockIndex}`}
                        block={block}
                    />
                ))}
            </div>

            {section.outro && (
                <p className="text-foreground/70 mt-6 text-sm leading-relaxed italic">
                    {section.outro}
                </p>
            )}
        </li>
    );
}
