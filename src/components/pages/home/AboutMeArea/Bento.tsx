import Core from '@/components/pages/home/AboutMeArea/Core';
import FacetCard from '@/components/pages/home/AboutMeArea/FacetCard';
import { facets } from '@/components/pages/home/AboutMeArea/contents';

// The sub-lg layout: the centred portrait over a 2x2 of glowing facet tiles,
// since the radial diagram needs width to read.
export default function Bento() {
    return (
        <div className="flex flex-col items-center gap-8 lg:hidden">
            <Core />

            <div className="grid w-full max-w-2xl grid-cols-2 gap-3">
                {facets.map((facet) => (
                    <FacetCard
                        key={facet.title}
                        facet={facet}
                        persistent
                        className="p-4"
                    />
                ))}
            </div>
        </div>
    );
}
