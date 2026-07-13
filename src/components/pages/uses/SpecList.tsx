interface SpecListProps {
    label?: string;
    specs: { label: string; value: string }[];
}

/**
 * Labeled specifications as an editorial definition table: a mono, tracked label
 * column beside the value, with a hairline under each row. Used for hardware
 * spec sheets and other key/value details.
 */
export default function SpecList({ label, specs }: SpecListProps) {
    return (
        <div>
            {label && (
                <h3 className="text-foreground/40 font-mono text-[11px] tracking-[0.18em] uppercase">
                    {label}
                </h3>
            )}
            <dl className={label ? 'mt-3' : undefined}>
                {specs.map((spec) => (
                    <div
                        key={spec.label}
                        className="border-foreground/10 grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b py-2.5 sm:grid-cols-[10rem_minmax(0,1fr)]"
                    >
                        <dt className="text-foreground/45 pt-0.5 font-mono text-[11px] tracking-wide uppercase">
                            {spec.label}
                        </dt>
                        <dd className="text-foreground/85 text-[15px]">
                            {spec.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
