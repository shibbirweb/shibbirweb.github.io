import type { UsesGroup } from '@/components/pages/uses/types';
import { groupLabels } from '@/components/pages/uses/meta';

export interface ContentsEntry {
    id: string;
    number: string;
    title: string;
    group: UsesGroup;
}

/**
 * The "In this issue" contents index: a two-column list of every entry with its
 * number, title, and part, each linking to its section. Doubles as the page's
 * navigation, in keeping with the editorial feel and staying server-rendered.
 */
export default function ContentsIndex({
    entries,
}: {
    entries: ContentsEntry[];
}) {
    return (
        <nav
            aria-label="Contents"
            className="mt-14"
        >
            <p className="text-foreground/40 font-mono text-[11px] tracking-[0.2em] uppercase">
                In this issue
            </p>

            <ol className="mt-5 grid gap-x-12 sm:grid-cols-2">
                {entries.map((entry) => (
                    <li key={entry.id}>
                        <a
                            href={`#${entry.id}`}
                            className="group border-foreground/10 flex items-baseline gap-4 border-b py-2.5"
                        >
                            <span className="text-foreground/40 font-mono text-xs tabular-nums">
                                {entry.number}
                            </span>
                            <span className="font-display text-foreground/85 text-lg transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                {entry.title}
                            </span>
                            <span className="text-foreground/35 ml-auto font-mono text-[10px] tracking-wider uppercase">
                                {groupLabels[entry.group]}
                            </span>
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
