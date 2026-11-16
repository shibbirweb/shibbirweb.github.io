import TopicPill from '@/components/pages/articles/ArticlesBrowse/TopicFilter/TopicPill';
import type { CountNoun } from '@/components/pages/articles/ArticlesBrowse/countNoun';
import type { TopicCount } from '@/utils/topicCounts';

/**
 * Every topic with its count, busiest first. The selected topic is filled and
 * links back to the unfiltered page, so picking it again clears it.
 */
export default function TopicFilter({
    topics,
    totalCount,
    active,
    basePath,
    countNoun,
    label,
}: {
    topics: TopicCount[];
    totalCount: number;
    active: string | null;
    /** The page the filter links to, e.g. `/articles`. */
    basePath: string;
    countNoun: CountNoun;
    /** The nav's accessible name, e.g. "Filter articles by tag". */
    label: string;
}) {
    return (
        <nav
            aria-label={label}
            className="flex flex-wrap gap-2"
        >
            <TopicPill
                label="All"
                count={totalCount}
                href={basePath}
                isActive={!active}
                countNoun={countNoun}
            />
            {topics.map((topic) => {
                const isActive = active === topic.tag;

                return (
                    <TopicPill
                        key={topic.tag}
                        label={topic.tag}
                        count={topic.count}
                        href={
                            isActive
                                ? basePath
                                : `${basePath}?tag=${encodeURIComponent(topic.tag)}`
                        }
                        isActive={isActive}
                        countNoun={countNoun}
                        clearsFilter={isActive}
                    />
                );
            })}
        </nav>
    );
}
