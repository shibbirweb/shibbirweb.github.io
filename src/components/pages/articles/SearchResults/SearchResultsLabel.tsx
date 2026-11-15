import { resolveResultsLabel } from '@/components/pages/articles/SearchResults/resultsLabel';

/** "3 articles found for “git”", with the query set apart. */
export default function SearchResultsLabel({
    count,
    query,
}: {
    count: number;
    query: string;
}) {
    return (
        <p className="text-foreground/70 text-sm">
            {resolveResultsLabel(count)}
            <span className="text-foreground font-medium">“{query}”</span>
        </p>
    );
}
