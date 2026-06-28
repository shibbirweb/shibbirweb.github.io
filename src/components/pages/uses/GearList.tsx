interface GearListProps {
    gear: { name: string; description: string }[];
}

export default function GearList({ gear }: GearListProps) {
    return (
        <ul className="flex flex-col gap-5">
            {gear.map((item) => (
                <li key={item.name}>
                    <h3 className="text-2xl font-semibold">{item.name}</h3>
                    <p className="text-foreground/70 mt-1 max-w-3xl text-xl leading-normal">
                        {item.description}
                    </p>
                </li>
            ))}
        </ul>
    );
}
