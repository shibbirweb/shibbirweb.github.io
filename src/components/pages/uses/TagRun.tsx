import { cn } from '@/utils/cn';

interface TagRunProps {
    label?: string;
    tags: string[];
}

/**
 * A group of tags rendered as an editorial keyword run: a wrapped list separated
 * by middots rather than pills, keeping the guide typographic and calm. The
 * /uses page uses this instead of the shared pill TagGroup so restyling here
 * never touches the /now page.
 */
export default function TagRun({ label, tags }: TagRunProps) {
    return (
        <div>
            {label && (
                <h3 className="text-foreground/40 font-mono text-[11px] tracking-[0.18em] uppercase">
                    {label}
                </h3>
            )}
            <ul className={cn('flex flex-wrap gap-x-3 gap-y-1', label && 'mt-3')}>
                {tags.map((tag) => (
                    <li
                        key={tag}
                        className="text-foreground/80 after:text-foreground/25 text-[15px] after:ml-3 after:content-['·'] last:after:content-none"
                    >
                        {tag}
                    </li>
                ))}
            </ul>
        </div>
    );
}
