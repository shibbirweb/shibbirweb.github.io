export default function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="marker:text-foreground/40 ml-5 flex max-w-3xl list-disc flex-col gap-2 text-2xl leading-normal">
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
}
