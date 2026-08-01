import PagerLink from '@/components/pages/articles/ArticlePager/PagerLink';
import SpotlightGroup from '@/components/pages/common/SpotlightGroup';
import type { ArticleSummary } from '@/lib/posts';

/**
 * Previous/next navigation across the chronological feed, so a reader who
 * reaches the end of one article can keep going. Renders nothing when the
 * article has no neighbours (e.g. a lone post).
 *
 * The SpotlightGroup wrapper owns the pointer listener for both cards and is
 * `contents`, so it generates no box and the nav keeps its own grid and label.
 */
export default function ArticlePager({
    previous,
    next,
}: {
    previous?: ArticleSummary;
    next?: ArticleSummary;
}) {
    if (!previous && !next) return null;

    return (
        <SpotlightGroup className="contents">
            <nav
                aria-label="More articles"
                className="mt-16 grid gap-4 sm:grid-cols-2"
            >
                {previous && (
                    <PagerLink
                        article={previous}
                        direction="previous"
                    />
                )}
                {next && (
                    <PagerLink
                        article={next}
                        direction="next"
                        alignEnd={Boolean(previous)}
                    />
                )}
            </nav>
        </SpotlightGroup>
    );
}
