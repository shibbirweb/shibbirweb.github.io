import { cn } from '@/utils/cn';

/**
 * Accent-marker bullet list. Used both as the `bullets` section body (Current
 * Focus) and for the achievement bullets inside experience/project entries. The
 * `›` marker prints black to match a printed CV.
 */
export default function BulletList({
    items,
    className,
}: {
    items: string[];
    className?: string;
}) {
    return (
        <ul className={cn('flex flex-col gap-1.5 print:gap-0.5', className)}>
            {items.map((item) => (
                <li
                    key={item}
                    className="text-foreground/80 flex gap-2 leading-relaxed print:gap-1.5 print:leading-[1.3]"
                >
                    <span
                        aria-hidden="true"
                        className="text-foreground/40 select-none print:text-black"
                    >
                        •
                    </span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}
