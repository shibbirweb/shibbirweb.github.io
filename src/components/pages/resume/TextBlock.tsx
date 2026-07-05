/** Body for the `text` section: a single freeform paragraph (e.g. Languages). */
export default function TextBlock({ text }: { text: string }) {
    return <p className="text-foreground/80 leading-relaxed">{text}</p>;
}
