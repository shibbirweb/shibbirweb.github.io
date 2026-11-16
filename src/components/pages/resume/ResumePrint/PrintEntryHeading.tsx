import type { ReactNode } from 'react';

/** An entry's title on the left and its dates (or other meta) on the right. */
export default function PrintEntryHeading({
    title,
    meta,
}: {
    title: ReactNode;
    meta?: string;
}) {
    return (
        <div className="flex break-after-avoid items-baseline justify-between gap-x-4">
            <h3 className="text-[11pt] font-semibold text-neutral-900">
                {title}
            </h3>
            {meta && <span className="shrink-0 text-neutral-500">{meta}</span>}
        </div>
    );
}
