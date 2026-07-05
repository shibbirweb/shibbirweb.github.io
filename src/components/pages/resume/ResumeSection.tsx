import type { ReactNode } from 'react';

/**
 * Shared section shell: an accent uppercase label over a hairline rule, then the
 * section body. Every resume section renders through this so the heading motif
 * stays consistent. The label prints black to match a printed CV.
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
            <h2 className="border-foreground/15 text-foreground/55 mb-3 border-b pb-1.5 font-mono text-[10px] font-semibold tracking-[0.2em] uppercase print:mb-2 print:pb-1 print:font-[Helvetica,Arial,sans-serif] print:text-[9.5pt] print:font-bold print:tracking-[0.06em] print:text-black">
                {label}
            </h2>
            {children}
        </section>
    );
}
