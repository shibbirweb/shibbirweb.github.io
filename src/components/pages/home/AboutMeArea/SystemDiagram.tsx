'use client';

import Core from '@/components/pages/home/AboutMeArea/Core';
import FacetCard from '@/components/pages/home/AboutMeArea/FacetCard';
import { facets } from '@/components/pages/home/AboutMeArea/contents';
import { useDrawOnScroll } from '@/components/pages/home/AboutMeArea/hooks/useDrawOnScroll';

export default function SystemDiagram() {
    const { ref, state } = useDrawOnScroll<HTMLDivElement>();
    const collapsed = state === 'collapsed';

    return (
        <div
            ref={ref}
            className="relative mx-auto hidden w-full max-w-4xl lg:grid lg:min-h-[30rem] lg:grid-cols-[1fr_auto_1fr] lg:grid-rows-[1fr_auto_1fr] lg:place-items-center lg:gap-x-10"
        >
            {/* Connector lines from the core to each node, drawn in on scroll.
                Desktop only; preserveAspectRatio="none" maps coords to percentages
                and non-scaling-stroke keeps the line weight constant. */}
            <svg
                aria-hidden
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 hidden size-full lg:block"
            >
                {facets.map((facet, index) => (
                    <path
                        key={facet.title}
                        d={`M50 50 L${facet.line.x} ${facet.line.y}`}
                        fill="none"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        pathLength={1}
                        strokeDasharray={1}
                        opacity={0.55}
                        style={{
                            stroke: facet.accent,
                            strokeDashoffset: collapsed ? 1 : 0,
                            transition:
                                state === 'static'
                                    ? 'none'
                                    : `stroke-dashoffset 900ms ease ${index * 160}ms`,
                        }}
                    />
                ))}
            </svg>

            <Core />

            {facets.map((facet) => (
                <FacetCard
                    key={facet.title}
                    facet={facet}
                />
            ))}
        </div>
    );
}
