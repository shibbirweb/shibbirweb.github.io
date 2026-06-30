import Menu, { MenuItem } from '@/components/admin/ui/Menu';
import type { ArticleListItem } from '@/lib/admin/types';

/** The per-article action menu, shared by the list and grid views. */
export default function RowActions({
    item,
    onEdit,
    onDuplicate,
    onPublish,
    onUnpublish,
    onDelete,
}: {
    item: ArticleListItem;
    onEdit: () => void;
    onDuplicate: () => void;
    onPublish: () => void;
    onUnpublish: () => void;
    onDelete: () => void;
}) {
    return (
        <Menu label={`Actions for ${item.title}`}>
            <MenuItem icon="pencil" onClick={onEdit}>
                Edit
            </MenuItem>
            <MenuItem icon="copy" onClick={onDuplicate}>
                Duplicate
            </MenuItem>
            {item.status === 'published' ? (
                <MenuItem icon="unpublish" onClick={onUnpublish}>
                    Unpublish
                </MenuItem>
            ) : (
                <MenuItem icon="publish" onClick={onPublish}>
                    Publish
                </MenuItem>
            )}
            <div className="bg-foreground/10 my-1 h-px" />
            <MenuItem icon="trash" danger onClick={onDelete}>
                Delete
            </MenuItem>
        </Menu>
    );
}
