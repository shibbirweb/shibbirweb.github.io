/** Body for the `text` section: one or more freeform paragraphs (e.g. Summary). */
export default function TextBlock({ paragraphs }: { paragraphs: string[] }) {
    return (
        <div className="flex flex-col gap-2.5">
            {paragraphs.map((paragraph) => (
                <p
                    key={paragraph}
                    className="text-foreground/80 leading-relaxed"
                >
                    {paragraph}
                </p>
            ))}
        </div>
    );
}
