interface SpecListProps {
    label?: string;
    specs: { label: string; value: string }[];
}

/**
 * A section's hardware rundown rendered as a spec sheet: each entry stacks a
 * muted uppercase label over its value in the monospace face, so the numbers and
 * part names line up like a datasheet. The grid uses auto-fill against the card's
 * real width (not a viewport breakpoint), so a wide feature card lays the specs
 * out in two or three columns while a compact card keeps them in one.
 */
export default function SpecList({ label, specs }: SpecListProps) {
    return (
        <div>
            {label && (
                <h3 className="text-foreground/60 mb-3 text-base font-bold">
                    {label}
                </h3>
            )}
            <dl className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-x-6 gap-y-4">
                {specs.map((spec) => (
                    <div key={spec.label}>
                        <dt className="text-foreground/70 text-xs font-semibold tracking-wide uppercase">
                            {spec.label}
                        </dt>
                        <dd className="text-foreground/90 mt-1 font-mono text-sm leading-snug">
                            {spec.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
