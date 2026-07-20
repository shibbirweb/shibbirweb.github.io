'use client';

import { useRef } from 'react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/components/layout/ThemeToggle/hooks/useTheme';
import { themeOptions } from '@/components/layout/ThemeToggle/options';
import { useDisclosure } from '@/components/layout/Navbar/hooks/useDisclosure';
import { useCloseOnEscape } from '@/components/layout/Navbar/hooks/useCloseOnEscape';
import { useCloseOnClickOutside } from '@/components/layout/Navbar/hooks/useCloseOnClickOutside';
import { useCloseOnRouteChange } from '@/components/layout/Navbar/hooks/useCloseOnRouteChange';

/**
 * Desktop theme control: a round icon button fixed to the top-right that opens a
 * small menu of the three preferences (light / system / dark). The trigger shows
 * the current preference's icon. Hidden on mobile, where the segmented
 * ThemeToggle lives inside the menu panel instead. It shares the navbar's
 * `visible` state, sliding in from the right edge in sync with it.
 */
export default function ThemeMenu({ visible }: { visible: boolean }) {
    const { preference, setPreference } = useTheme();
    const { open, toggle, close } = useDisclosure();
    const menuRef = useRef<HTMLDivElement>(null);
    useCloseOnEscape(open, close);
    useCloseOnClickOutside(menuRef, open, close);
    useCloseOnRouteChange(close);

    const ActiveIcon =
        themeOptions.find((option) => option.value === preference)?.Icon ??
        themeOptions[0].Icon;

    return (
        <div
            ref={menuRef}
            className={cn(
                'fixed top-4 right-4 z-50 hidden transition-all duration-700 ease-in-out motion-reduce:transition-none md:block',
                visible
                    ? 'visible translate-x-0 opacity-100'
                    : 'pointer-events-none invisible translate-x-24 opacity-0'
            )}
        >
            <button
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Theme"
                title="Theme"
                className="focus-ring border-foreground/10 bg-background/60 text-foreground/80 hover:text-foreground relative flex size-11 cursor-pointer items-center justify-center rounded-full border shadow-lg shadow-black/5 backdrop-blur-lg transition-colors"
            >
                <ActiveIcon
                    aria-hidden="true"
                    className="size-5"
                />
            </button>
            <div
                className={cn(
                    'absolute top-full right-0 mt-2',
                    open ? '' : 'pointer-events-none'
                )}
            >
                <div
                    role="menu"
                    aria-label="Theme"
                    className={cn(
                        'border-foreground/10 bg-background/70 w-44 origin-top-right rounded-2xl border p-2 shadow-xl shadow-black/10 backdrop-blur-lg transition-all duration-200 ease-out',
                        open
                            ? 'visible scale-100 opacity-100'
                            : 'invisible scale-95 opacity-0'
                    )}
                >
                    <ul className="flex flex-col gap-0.5">
                        {themeOptions.map(({ value, label, Icon }) => {
                            const active = preference === value;
                            return (
                                <li
                                    key={value}
                                    role="none"
                                >
                                    <button
                                        type="button"
                                        role="menuitemradio"
                                        aria-checked={active}
                                        onClick={() => {
                                            setPreference(value);
                                            close();
                                        }}
                                        className={cn(
                                            'focus-ring flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors',
                                            active
                                                ? 'bg-foreground/10 text-foreground font-semibold'
                                                : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                                        )}
                                    >
                                        <Icon
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                        {label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
