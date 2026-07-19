/**
 * A plain list of items inside a /now card (reading list, goals). Each row hangs
 * off a small accent dot in the card's --card-accent, so the list picks up the
 * card's colour and echoes the accent-rule motif used by the /uses GearList,
 * without competing with the card's bloom.
 */
export default function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="flex flex-col gap-3">
            {items.map((item) => (
                <li
                    key={item}
                    className="text-foreground/80 flex items-baseline gap-3 text-sm leading-relaxed"
                >
                    <span
                        aria-hidden="true"
                        className="mt-1.5 size-1.5 shrink-0 rounded-full"
                        style={{
                            backgroundColor:
                                'color-mix(in oklab, var(--card-accent, var(--foreground)) 70%, transparent)',
                        }}
                    />
                    {item}
                </li>
            ))}
        </ul>
    );
}
