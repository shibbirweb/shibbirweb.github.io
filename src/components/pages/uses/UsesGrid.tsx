import type { UsesSectionData } from '@/components/pages/uses/types';
import UsesCard from '@/components/pages/uses/UsesCard';

/**
 * Bento gallery for the /uses page: a responsive grid of accent-glow cards, one
 * per section. Wide sections span two columns (UsesCard reads section.wide);
 * cards stretch to fill their cell (items-stretch is the grid default plus each
 * card is h-full), so a row has no gaps even when its cards hold different
 * amounts of content. grid-flow-row-dense backfills the slot a wide card would
 * otherwise leave open at a row's end.
 */
export default function UsesGrid({
    sections,
}: {
    sections: UsesSectionData[];
}) {
    return (
        <ul className="grid grid-flow-row-dense gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, index) => (
                <UsesCard
                    key={section.title}
                    section={section}
                    index={index}
                />
            ))}
        </ul>
    );
}
