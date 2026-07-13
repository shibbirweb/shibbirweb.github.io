interface GearListProps {
    gear: { name: string; description: string }[];
}

/**
 * Named gear with a short write-up, as an editorial list: a display-face name
 * over prose, items separated by hairlines.
 */
export default function GearList({ gear }: GearListProps) {
    return (
        <ul className="divide-foreground/10 border-foreground/10 divide-y border-t">
            {gear.map((item) => (
                <li
                    key={item.name}
                    className="py-4 first:pt-0"
                >
                    <h3 className="font-display text-xl font-semibold">
                        {item.name}
                    </h3>
                    <p className="text-foreground/70 mt-1.5 max-w-2xl leading-relaxed">
                        {item.description}
                    </p>
                </li>
            ))}
        </ul>
    );
}
