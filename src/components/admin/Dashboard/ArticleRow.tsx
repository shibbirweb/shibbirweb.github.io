import Link from 'next/link';
import CoverThumb from '@/components/admin/Dashboard/CoverThumb';
import RowActions from '@/components/admin/Dashboard/RowActions';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import Icon from '@/components/admin/ui/Icon';
import { formatDate } from '@/utils/formatDate';
import { timeAgo } from '@/utils/timeAgo';
import { editorHref } from '@/components/admin/Dashboard/links';
import { cn } from '@/utils/cn';
import type { ArticleListItem } from '@/lib/admin/types';

/** One article as a rich list row in the dashboard. */
export default function ArticleRow({
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
                'group flex min-w-0 items-center gap-3 px-3 py-2.5 transition-colors sm:gap-4',
                selected ? 'bg-violet-500/[0.06]' : 'hover:bg-foreground/[0.03]'
            )}
        >
            <input
                type="checkbox"
                checked={selected}
                onChange={onToggleSelect}
                aria-label={`Select ${item.title}`}
                className="size-4 shrink-0 cursor-pointer accent-violet-600"
            />

            <Link
                href={href}
                className="relative aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-md border border-foreground/10 sm:w-20"
            >
                <CoverThumb item={item} className="h-full w-full" />
            </Link>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <Link
                        href={href}
                        className="hover:text-violet-600 truncate font-semibold transition-colors dark:hover:text-violet-400"
                    >
                        {item.title}
                    </Link>
                    {item.featured && (
                        <Icon
                            name="star"
                            className="size-3.5 shrink-0 fill-amber-400 text-amber-400"
                        />
                    )}
                </div>
                <div className="text-foreground/50 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="font-mono">/{item.slug}</span>
                    {item.category && (
                        <>
                            <span aria-hidden>·</span>
                            <span>{item.category}</span>
                        </>
                    )}
                    {item.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="bg-foreground/[0.06] rounded px-1.5 py-0.5"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="text-foreground/55 hidden w-24 shrink-0 text-right text-xs lg:block">
                <div>{item.readingMinutes} min read</div>
                <div className="text-foreground/40">{item.wordCount} words</div>
            </div>

            <div className="hidden w-32 shrink-0 text-right text-xs xl:block">
                <div className="text-foreground/55">
                    {item.date ? formatDate(item.date) : 'No date'}
                </div>
                <div className="text-foreground/40">
                    {item.updated
                        ? `Updated ${formatDate(item.updated)}`
                        : `edited ${timeAgo(item.lastModified)}`}
                </div>
            </div>

            <div className="w-20 shrink-0 sm:w-24">
                <StatusBadge status={item.status} />
            </div>

            <div className="shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
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
    );
}
