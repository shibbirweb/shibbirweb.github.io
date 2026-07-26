'use client';

import Button from '@/components/ui/Button';
import ChevronIcon from '@/components/icons/chevron';
import { useDisclosure } from '@/components/layout/Navbar/hooks/useDisclosure';
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

const revealRegionId = 'more-package-projects';

/**
 * Holds the tail of the packages grid behind a "Show more" toggle so the
 * section opens short. The hidden cards stay in the DOM (plain `hidden`, not
 * unmounted), so they still ship in the static export and stay reachable by
 * crawlers and in-page find.
 *
 * Renders as two siblings with no margins of their own: the parent group's
 * `space-y-6` spaces them, and a `hidden` child generates no box, so the gap
 * stays correct in both states.
 */
export default function MorePackageProjects({
    children,
}: {
    children: ReactNode;
}) {
    const { open, toggle } = useDisclosure();

    return (
        <>
            <div
                id={revealRegionId}
                hidden={!open}
            >
                {children}
            </div>

            <div className="text-center">
                <Button
                    variant="text"
                    onClick={toggle}
                    aria-expanded={open}
                    aria-controls={revealRegionId}
                >
                    {open ? 'Show less' : 'Show more'}
                    <ChevronIcon
                        aria-hidden="true"
                        className={cn(
                            'size-4 transition-transform duration-300',
                            !open && 'rotate-180'
                        )}
                    />
                </Button>
            </div>
        </>
    );
}
