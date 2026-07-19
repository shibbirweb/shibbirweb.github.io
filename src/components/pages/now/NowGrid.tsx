import type { NowSectionData } from '@/components/pages/now/types';
import NowCard from '@/components/pages/now/NowCard';

/**
 * Bento snapshot for the /now page, the sibling of UsesGrid: a responsive grid of
 * accent-glow cards, one per section. Wide sections span two columns (NowCard
 * reads section.wide); cards stretch to fill their cell (items-stretch is the grid
 * default plus each card is h-full), so a row has no gaps even when its cards hold
 * different amounts of content. grid-flow-row-dense backfills the slot a wide card
 * would otherwise leave open at a row's end.
 */
export default function NowGrid({
    sections,
}: {
    sections: NowSectionData[];
}) {
    return (
        <ul className="grid grid-flow-row-dense gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, index) => (
                <NowCard
                    key={section.title}
                    section={section}
                    index={index}
                />
            ))}
        </ul>
    );
}
