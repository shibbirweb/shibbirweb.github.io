/** A titled group of related frontmatter fields in the details drawer. */
export default function FormSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="border-foreground/10 border-t pt-5 first:border-t-0 first:pt-0">
            <h3 className="text-foreground/50 mb-3 text-xs font-semibold tracking-wider uppercase">
                {title}
            </h3>
            <div className="space-y-4">{children}</div>
        </section>
    );
}
