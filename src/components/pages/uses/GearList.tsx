interface GearListProps {
    gear: { name: string; description: string }[];
}

/**
 * Named gear with a short note on why it earns a spot, rendered inside a /uses
 * card. Each item hangs off a slim accent rule (the card's --card-accent) so the
 * list picks up the card's colour without competing with the glow.
 */
export default function GearList({ gear }: GearListProps) {
    return (
        <ul className="flex flex-col gap-5">
            {gear.map((item) => (
                <li
                    key={item.name}
                    className="border-l-2 pl-4"
                    style={{
                        borderColor:
                            'color-mix(in oklab, var(--card-accent, var(--foreground)) 45%, transparent)',
                    }}
                >
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-foreground/70 mt-1 text-sm leading-relaxed">
                        {item.description}
                    </p>
                </li>
            ))}
        </ul>
    );
}
