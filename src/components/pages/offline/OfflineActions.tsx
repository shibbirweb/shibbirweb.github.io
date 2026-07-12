'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import ResetIcon from '@/components/icons/reset';

/**
 * Offline page actions. "Try again" reloads the current URL (the page the user
 * was actually trying to reach), so a restored connection resolves it directly
 * instead of bouncing home. "Back home" is a plain link to a likely cached route.
 */
export default function OfflineActions() {
    return (
        <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button
                type="button"
                onClick={() => window.location.reload()}
            >
                <ResetIcon
                    aria-hidden="true"
                    className="size-4"
                />
                Try again
            </Button>
            <Link
                href="/"
                className="border-foreground/15 hover:bg-foreground/5 inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors"
            >
                Back home
            </Link>
        </div>
    );
}
