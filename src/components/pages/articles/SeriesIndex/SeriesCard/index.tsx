import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import SeriesCoverStack from '@/components/pages/articles/SeriesIndex/SeriesCoverStack';
import SeriesMeta from '@/components/pages/articles/SeriesIndex/SeriesMeta';
import SeriesPartList from '@/components/pages/articles/SeriesIndex/SeriesPartList';
import SeriesTags from '@/components/pages/articles/SeriesIndex/SeriesTags';
import TechStack from '@/components/pages/articles/TechStack';
import StartSeriesLink from '@/components/pages/articles/SeriesIndex/StartSeriesLink';
import styles from '@/components/pages/articles/SeriesIndex/SeriesCard/SeriesCard.module.css';
import { accentStyle } from '@/utils/accentStyle';
import { cn } from '@/utils/cn';
import type { SeriesShelfEntry } from '@/utils/seriesShelf';

/**
 * One series in the grid view: the part covers as a deck, then its name, length,
 * parts as numbered steps, the topics and stack it covers, and a way in at
 * part 1.
 */
export default function SeriesCard({
    series,
    eagerCover = false,
}: {
    series: SeriesShelfEntry;
    eagerCover?: boolean;
}) {
    return (
        <li
            {...spotlightSurfaceProps}
            style={accentStyle(series.accentColors)}
            className={cn(
                styles.panel,
                'border-foreground/10 bg-foreground/[0.02] relative isolate flex h-full flex-col rounded-2xl border p-5 sm:p-6'
            )}
        >
            <SeriesCoverStack
                parts={series.parts}
                eager={eagerCover}
            />
            <SeriesMeta
                series={series}
                className="mt-6"
            />
            <h2 className="mt-1.5 text-lg leading-snug font-bold sm:text-xl">
                {series.name}
            </h2>
            <SeriesPartList
                parts={series.parts}
                className="mt-4 grow"
            />
            <SeriesTags
                tags={series.tags}
                className="mt-5"
            />
            <TechStack
                tech={series.tech}
                className="mt-4"
            />
            <StartSeriesLink
                firstPartSlug={series.parts[0].slug}
                seriesName={series.name}
                className="mt-5 self-start"
            />

            <SpotlightBorder className={styles.spotlightBorder} />
        </li>
    );
}
