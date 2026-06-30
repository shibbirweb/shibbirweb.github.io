import Button from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';

/** Shown when the dashboard has no articles, or none match the active filters. */
export default function EmptyState({
    hasArticles,
    onCreate,
}: {
    hasArticles: boolean;
    onCreate: () => void;
}) {
    return (
        <div className="border-foreground/10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-20 text-center">
            <Icon name="file" className="text-foreground/30 size-10" />
            <p className="text-foreground/60 text-sm">
                {hasArticles
                    ? 'No articles match your filters.'
                    : 'No articles yet. Create your first one.'}
            </p>
            {!hasArticles && (
                <Button variant="primary" onClick={onCreate}>
                    <Icon name="plus" className="size-4" />
                    New article
                </Button>
            )}
        </div>
    );
}
