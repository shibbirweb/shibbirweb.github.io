import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import SeriesCoverStack from '@/components/pages/articles/SeriesIndex/SeriesCoverStack';
import SeriesMeta from '@/components/pages/articles/SeriesIndex/SeriesMeta';
import SeriesPartList from '@/components/pages/articles/SeriesIndex/SeriesPartList';
import SeriesTags from '@/components/pages/articles/SeriesIndex/SeriesTags';
import TechStack from '@/components/pages/articles/TechStack';
import StartSeriesLink from '@/components/pages/articles/SeriesIndex/StartSeriesLink';
import styles from '@/components/pages/articles/SeriesIndex/SeriesRow/SeriesRow.module.css';
import { accentStyle } from '@/utils/accentStyle';
import { cn } from '@/utils/cn';
import type { SeriesShelfEntry } from '@/utils/seriesShelf';

/**
 * One series in the list view: a small cover deck on the left, then its name,
 * length and parts, with the way in at part 1 on the right.
 */
export default function SeriesRow({ series }: { series: SeriesShelfEntry }) {
    return (
        <li
            {...spotlightSurfaceProps}
            style={accentStyle(series.accentColors)}
            className={cn(
                styles.panel,
                'border-foreground/10 bg-foreground/[0.02] relative isolate flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:gap-6'
            )}
        >
            <SeriesCoverStack
                parts={series.parts}
                className="w-40 flex-none sm:w-44"
            />
            <div className="min-w-0 grow">
                <SeriesMeta series={series} />
                <h2 className="mt-1 text-base leading-snug font-bold sm:text-lg">
                    {series.name}
                </h2>
                <SeriesPartList
                    parts={series.parts}
                    className="mt-2"
                />
                <SeriesTags
                    tags={series.tags}
                    className="mt-3"
                />
                <TechStack
                    tech={series.tech}
                    className="mt-3"
                />
            </div>
            <StartSeriesLink
                firstPartSlug={series.parts[0].slug}
                seriesName={series.name}
                className="flex-none self-start sm:self-center"
            />

            <SpotlightBorder className={styles.spotlightBorder} />
        </li>
    );
}
