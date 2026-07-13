import { cn } from '@/utils/cn';

interface ExtensionListProps {
    label?: string;
    extensions: {
        name: string;
        publisher: string;
        itemName: string;
        description: string;
    }[];
}

const marketplaceBase =
    'https://marketplace.visualstudio.com/items?itemName=';

/**
 * Editor extensions as an editorial list: the extension name links to its VS
 * Code Marketplace page, paired with its publisher in mono and a one-line reason
 * beneath, with hairline dividers between rows.
 */
export default function ExtensionList({ label, extensions }: ExtensionListProps) {
    return (
        <div>
            {label && (
                <h3 className="text-foreground/40 font-mono text-[11px] tracking-[0.18em] uppercase">
                    {label}
                </h3>
            )}
            <ul
                className={cn(
                    'divide-foreground/10 border-foreground/10 divide-y border-t',
                    label && 'mt-3'
                )}
            >
                {extensions.map((extension) => (
                    <li
                        key={extension.itemName}
                        className="py-3.5 first:pt-0"
                    >
                        <div className="flex items-baseline justify-between gap-3">
                            <a
                                href={`${marketplaceBase}${extension.itemName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group font-semibold transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                                {extension.name}
                                <span
                                    aria-hidden="true"
                                    className="text-foreground/30 ml-1 inline-block text-xs transition-colors group-hover:text-emerald-600 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-safe:transition-transform dark:group-hover:text-emerald-400"
                                >
                                    ↗
                                </span>
                            </a>
                            <span className="text-foreground/40 shrink-0 font-mono text-xs">
                                {extension.publisher}
                            </span>
                        </div>
                        <p className="text-foreground/70 mt-1 text-sm leading-relaxed">
                            {extension.description}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
