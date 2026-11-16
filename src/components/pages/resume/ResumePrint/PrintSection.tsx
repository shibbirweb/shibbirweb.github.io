import type { ReactNode } from 'react';

/** Section shell: dark uppercase label over a grey hairline, then the body. */
export default function PrintSection({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <section>
            <h2 className="mb-1 break-after-avoid border-b border-neutral-300 pb-0.5 text-[10pt] font-bold tracking-wide text-neutral-900 uppercase">
                {label}
            </h2>
            {children}
        </section>
    );
}
