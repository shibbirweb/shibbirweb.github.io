'use client';

import { cn } from '@/utils/cn';
import { useTheme } from '@/components/layout/ThemeToggle/hooks/useTheme';
import { themeOptions } from '@/components/layout/ThemeToggle/options';

/**
 * Segmented three-icon control for the theme preference (light / system / dark).
 * Used in the mobile menu panel; the wrapper's background/spacing is left to the
 * caller via `className`.
 */
export default function ThemeToggle({ className }: { className?: string }) {
    const { preference, setPreference } = useTheme();

    return (
        <div
            role="group"
            aria-label="Theme"
            className={cn('flex items-center gap-0.5', className)}
        >
            {themeOptions.map(({ value, label, Icon }) => {
                const active = preference === value;
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setPreference(value)}
                        aria-pressed={active}
                        aria-label={`${label} theme`}
                        title={`${label} theme`}
                        className={cn(
                            'flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors',
                            active
                                ? 'bg-foreground/10 text-foreground'
                                : 'text-foreground/60 hover:text-foreground'
                        )}
                    >
                        <Icon
                            aria-hidden="true"
                            className="size-4"
                        />
                    </button>
                );
            })}
        </div>
    );
}
