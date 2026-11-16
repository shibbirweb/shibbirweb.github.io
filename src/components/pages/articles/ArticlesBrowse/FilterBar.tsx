'use client';

import type { ReactNode } from 'react';
import ActiveTopicChip from '@/components/pages/articles/ArticlesBrowse/ActiveTopicChip';
import FiltersButton from '@/components/pages/articles/ArticlesBrowse/FiltersButton';
import TopicFilter from '@/components/pages/articles/ArticlesBrowse/TopicFilter';
import { useDisclosure } from '@/components/layout/Navbar/hooks/useDisclosure';
import { cn } from '@/utils/cn';
import type { CountNoun } from '@/components/pages/articles/ArticlesBrowse/countNoun';
import type { TopicCount } from '@/utils/topicCounts';

const TOPIC_PANEL_ID = 'topic-filters';

/**
 * One slim line with the page's own `leading` content on the left and a Filters
 * button (plus any `trailing` controls) on the right. The topics stay folded away behind that button; it opens
 * on its own when the page loads with a topic applied, and while it is closed a
 * chip beside it names the applied topic. Shared by /articles and
 * /articles/series.
 */
export default function FilterBar({
    leading,
    trailing,
    topics,
    totalCount,
    activeTag,
    basePath,
    countNoun,
    label,
    className,
}: {
    leading?: ReactNode;
    trailing?: ReactNode;
    topics: TopicCount[];
    totalCount: number;
    activeTag: string | null;
    basePath: string;
    countNoun: CountNoun;
    label: string;
    /** Overrides the default top margin. */
    className?: string;
}) {
    const { open: filtersOpen, toggle } = useDisclosure(Boolean(activeTag));

    return (
        <div className={cn('mt-10', className)}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {leading}
                <div className="ml-auto flex flex-wrap items-center gap-2">
                    {activeTag && !filtersOpen && (
                        <ActiveTopicChip
                            tag={activeTag}
                            clearHref={basePath}
                        />
                    )}
                    {topics.length > 0 && (
                        <FiltersButton
                            isOpen={filtersOpen}
                            hasActiveFilter={Boolean(activeTag)}
                            panelId={TOPIC_PANEL_ID}
                            onToggle={toggle}
                        />
                    )}
                    {trailing}
                </div>
            </div>
            <div
                id={TOPIC_PANEL_ID}
                hidden={!filtersOpen}
                className="border-foreground/10 mt-4 rounded-2xl border p-4"
            >
                <TopicFilter
                    topics={topics}
                    totalCount={totalCount}
                    active={activeTag}
                    basePath={basePath}
                    countNoun={countNoun}
                    label={label}
                />
            </div>
        </div>
    );
}
