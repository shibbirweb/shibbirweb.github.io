import { cn } from '@/utils/cn';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'danger'
    | 'subtle';
export type ButtonSize = 'sm' | 'md';

const VARIANTS: Record<ButtonVariant, string> = {
    primary:
        'bg-violet-600 text-white hover:bg-violet-500 hover:shadow border border-violet-600 shadow-sm',
    secondary:
        'bg-foreground/[0.04] text-foreground border border-foreground/15 hover:border-foreground/40 hover:bg-foreground/[0.07]',
    ghost: 'text-foreground/70 hover:text-foreground hover:bg-foreground/[0.06] border border-transparent',
    danger: 'bg-red-600/10 text-red-600 border border-red-600/30 hover:bg-red-600 hover:text-white dark:text-red-400 dark:hover:text-white',
    subtle: 'bg-foreground/[0.06] text-foreground/80 border border-transparent hover:bg-foreground/10',
};

const SIZES: Record<ButtonSize, string> = {
    sm: 'h-8 gap-1.5 px-2.5 text-xs',
    md: 'h-10 gap-2 px-4 text-sm',
};

const FOCUS_RING =
    'focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none';

/** Shared classes so a `<Link>` can look identical to a `<Button>`. */
export function buttonClasses(
    variant: ButtonVariant = 'secondary',
    size: ButtonSize = 'md',
    className?: string
): string {
    return cn(
        'inline-flex cursor-pointer items-center justify-center rounded-lg font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50',
        FOCUS_RING,
        VARIANTS[variant],
        SIZES[size],
        className
    );
}

/**
 * Shared classes for icon-only buttons (toolbar, menus, segmented controls), so
 * every one carries the same hover, radius, and keyboard focus ring as Button.
 */
export function iconButtonClasses(className?: string): string {
    return cn(
        'grid place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground',
        FOCUS_RING,
        className
    );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

export default function Button({
    variant = 'secondary',
    size = 'md',
    className,
    type = 'button',
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            className={buttonClasses(variant, size, className)}
            {...rest}
        />
    );
}
