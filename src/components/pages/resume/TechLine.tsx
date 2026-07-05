/**
 * The "Technologies" line under an experience or project entry. On screen each
 * item is a subtle chip so the stack stands out; in print it collapses to a
 * plain comma-separated list (resume-standard, and print drops chip backgrounds).
 */
export default function TechLine({ tech }: { tech: string[] }) {
    return (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 print:mt-1.5 print:gap-x-1">
            <span className="text-foreground/80 text-[13px] font-semibold print:text-[9.5pt]">
                Technologies:
            </span>

            {/* Screen: highlighted chips. */}
            {tech.map((item) => (
                <span
                    key={item}
                    className="bg-foreground/[0.07] text-foreground/85 rounded px-2 py-0.5 text-[11px] print:hidden"
                >
                    {item}
                </span>
            ))}

            {/* Print: plain comma-separated list. */}
            <span className="hidden text-[9.5pt] text-black/80 print:inline">
                {tech.join(', ')}
            </span>
        </div>
    );
}
