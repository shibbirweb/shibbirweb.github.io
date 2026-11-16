import { cn } from '@/utils/cn';
import { tocDepth } from '@/components/pages/articles/TableOfContents/TocRail/railPath';
import type { TocItem } from '@/lib/posts';

/**
 * One heading link beside the rail. Every section on screen reads bright;
 * the rest stay muted until hovered. `aria-current` marks the single current
 * heading, which the sidebar keeps scrolled into view.
 */
export default function TocRailItem({
    item,
    isCurrent,
    isVisible,
}: {
    item: TocItem;
    isCurrent: boolean;
    isVisible: boolean;
}) {
    const depth = tocDepth(item.level);

    return (
        <li>
            <a
                href={`#${item.id}`}
                data-toc-depth={depth}
                aria-current={isCurrent ? 'location' : undefined}
                className={cn(
                    'focus-ring block rounded-md py-1.5 pr-2 leading-snug transition-colors duration-300',
                    depth === 1 ? 'pl-7' : 'pl-4',
                    isVisible
                        ? 'text-foreground'
                        : 'text-foreground/55 hover:text-foreground'
                )}
            >
                {item.text}
            </a>
        </li>
    );
}
