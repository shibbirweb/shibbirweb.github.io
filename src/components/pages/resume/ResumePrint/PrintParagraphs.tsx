/** Printed body for the `text` section: its paragraphs, slightly apart. */
export default function PrintParagraphs({
    paragraphs,
}: {
    paragraphs: string[];
}) {
    return (
        <div className="flex flex-col gap-1.5">
            {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
            ))}
        </div>
    );
}
