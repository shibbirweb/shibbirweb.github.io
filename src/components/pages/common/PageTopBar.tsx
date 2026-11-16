import type { ReactNode } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';

/**
 * The top of a section page (articles, uses, now): the breadcrumb, which already
 * names the page, with an optional control on the right of the same row. The
 * page's h1 and its intro line are still here for screen readers and search
 * engines, just not shown, so the page opens straight onto its content.
 */
export default function PageTopBar({
    title,
    description,
    action,
}: {
    /** The page's h1 text, read out but not shown. */
    title: string;
    /** The page's intro line, read out after the h1 but not shown. */
    description?: string;
    /** A control on the right of the breadcrumb row, e.g. search. */
    action?: ReactNode;
}) {
    return (
        <>
            <div className="flex min-h-11 items-center justify-between gap-4">
                <Breadcrumb className="mb-0" />
                {action}
            </div>
            <h1 className="sr-only">{title}</h1>
            {description && <p className="sr-only">{description}</p>}
        </>
    );
}
