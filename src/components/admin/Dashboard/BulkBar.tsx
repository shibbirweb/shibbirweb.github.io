import Button from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';

/** The action bar shown while one or more articles are selected. */
export default function BulkBar({
    count,
    busy,
    onPublish,
    onUnpublish,
    onDelete,
    onClear,
}: {
    count: number;
    busy: boolean;
    onPublish: () => void;
    onUnpublish: () => void;
    onDelete: () => void;
    onClear: () => void;
}) {
    return (
        <div className="border-foreground/10 bg-foreground/[0.03] flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2">
            <span className="text-foreground/70 px-1 text-sm font-medium">
                {count} selected
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
                <Button size="sm" variant="secondary" onClick={onPublish} disabled={busy}>
                    <Icon name="publish" className="size-4" />
                    Publish
                </Button>
                <Button size="sm" variant="secondary" onClick={onUnpublish} disabled={busy}>
                    <Icon name="unpublish" className="size-4" />
                    Unpublish
                </Button>
                <Button size="sm" variant="danger" onClick={onDelete} disabled={busy}>
                    <Icon name="trash" className="size-4" />
                    Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={onClear} disabled={busy}>
                    Clear
                </Button>
            </div>
        </div>
    );
}
