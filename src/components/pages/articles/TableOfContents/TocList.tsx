import { cn } from '@/utils/cn';
import type { TocItem } from '@/lib/posts';

/**
 * The shared list of heading links behind both the desktop sidebar and the
 * mobile disclosure. The active heading (tracked by scroll position) gets the
 * article's accent colour and a filled marker; nested H3s are indented under
 * their H2.
 */
export default function TocList({
    toc,
    activeId,
    onNavigate,
}: {
    toc: TocItem[];
    activeId: string | null;
    onNavigate?: () => void;
}) {
    return (
        <ul className="space-y-1 text-sm">
            {toc.map((item) => {
                const isActive = item.id === activeId;
                return (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            onClick={onNavigate}
                            aria-current={isActive ? 'location' : undefined}
                            className={cn(
                                'group flex items-center gap-2 rounded-md py-1 leading-snug transition-colors',
                                item.level === 3 ? 'pl-5' : 'pl-2',
                                isActive
                                    ? 'text-[var(--accent-to)]'
                                    : 'text-foreground/70 hover:text-foreground'
                            )}
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    'h-1 w-1 flex-none rounded-full transition-all',
                                    isActive
                                        ? 'scale-125 bg-[var(--accent-to)]'
                                        : 'bg-foreground/25 group-hover:bg-foreground/50'
                                )}
                            />
                            <span className="min-w-0">{item.text}</span>
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}
