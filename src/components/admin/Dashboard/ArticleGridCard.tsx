import Link from 'next/link';
import CoverThumb from '@/components/admin/Dashboard/CoverThumb';
import RowActions from '@/components/admin/Dashboard/RowActions';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import Icon from '@/components/admin/ui/Icon';
import { formatDate } from '@/utils/formatDate';
import { editorHref } from '@/components/admin/Dashboard/links';
import { cn } from '@/utils/cn';
import type { ArticleListItem } from '@/lib/admin/types';

/** One article as a thumbnail-forward card in the dashboard's grid view. */
export default function ArticleGridCard({
    item,
    selected,
    onToggleSelect,
    onDuplicate,
    onPublish,
    onUnpublish,
    onDelete,
    onEdit,
}: {
    item: ArticleListItem;
    selected: boolean;
    onToggleSelect: () => void;
    onDuplicate: () => void;
    onPublish: () => void;
    onUnpublish: () => void;
    onDelete: () => void;
    onEdit: () => void;
}) {
    const href = editorHref(item.id);

    return (
        <div
            className={cn(
                'group flex flex-col overflow-hidden rounded-2xl border transition-colors',
                selected
                    ? 'border-violet-500/60 bg-violet-500/[0.05]'
                    : 'border-foreground/10 hover:border-foreground/25'
            )}
        >
            <div className="relative">
                <Link
                    href={href}
                    className="block aspect-[16/9] overflow-hidden"
                >
                    <CoverThumb
                        item={item}
                        className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                </Link>
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onToggleSelect}
                    aria-label={`Select ${item.title}`}
                    className="absolute top-2.5 left-2.5 size-4 cursor-pointer accent-violet-600"
                />
                <div className="absolute top-2.5 right-2.5">
                    <StatusBadge status={item.status} />
                </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start gap-2">
                    <Link
                        href={href}
                        className="hover:text-violet-600 line-clamp-2 flex-1 font-semibold transition-colors dark:hover:text-violet-400"
                    >
                        {item.title}
                    </Link>
                    {item.featured && (
                        <Icon
                            name="star"
                            className="mt-0.5 size-4 shrink-0 fill-amber-400 text-amber-400"
                        />
                    )}
                </div>
                <p className="text-foreground/55 mt-1 font-mono text-xs">
                    /{item.slug}
                </p>
                {item.description && (
                    <p className="text-foreground/65 mt-2 line-clamp-2 text-sm">
                        {item.description}
                    </p>
                )}
                <div className="text-foreground/45 mt-auto flex items-center justify-between pt-4 text-xs">
                    <span>
                        {item.date ? formatDate(item.date) : 'No date'} ·{' '}
                        {item.readingMinutes} min
                    </span>
                    <RowActions
                        item={item}
                        onEdit={onEdit}
                        onDuplicate={onDuplicate}
                        onPublish={onPublish}
                        onUnpublish={onUnpublish}
                        onDelete={onDelete}
                    />
                </div>
            </div>
        </div>
    );
}
