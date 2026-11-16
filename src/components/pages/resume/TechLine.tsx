/**
 * The "Technologies" line under an experience or project entry. On screen each
 * item is a subtle chip so the stack stands out.
 */
export default function TechLine({ tech }: { tech: string[] }) {
    return (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="text-foreground/80 text-[13px] font-semibold">
                Technologies:
            </span>

            {tech.map((item) => (
                <span
                    key={item}
                    className="bg-foreground/[0.07] text-foreground/85 rounded px-2 py-0.5 text-[11px]"
                >
                    {item}
                </span>
            ))}
        </div>
    );
}
