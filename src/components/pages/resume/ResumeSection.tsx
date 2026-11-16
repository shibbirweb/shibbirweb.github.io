import type { ReactNode } from 'react';

/**
 * Shared section shell: an accent uppercase label over a hairline rule, then the
 * section body. Every resume section renders through this so the heading motif
 * stays consistent.
 */
export default function ResumeSection({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <section>
            <h2 className="border-foreground/15 text-foreground/70 mb-3 border-b pb-1.5 font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
                {label}
            </h2>
            {children}
        </section>
    );
}
