import { cn } from '@/utils/cn';
import Spinner from '@/components/ui/Spinner';

export type ButtonVariant = 'primary' | 'outline' | 'text';

const buttonBaseClassName =
    'focus-ring inline-flex min-h-11 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors';

const variantClassNames: Record<ButtonVariant, string> = {
    primary:
        'bg-foreground text-background hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-60',
    outline:
        'border-foreground/15 border hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-60',
    // Reads as an underlined text link while staying a real button. For quiet,
    // in-flow actions (a "Show more" reveal) that should not compete with the
    // filled and outlined actions around them.
    text: 'text-foreground/70 decoration-foreground/30 hover:text-foreground hover:decoration-foreground underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-60',
};

/**
 * The shared button styling, reused by Button and by ButtonLink (a link that
 * reads as a button). Kept separate so a non-`<button>` element can wear the same
 * look without duplicating the class list.
 */
export function buttonClassName(
    variant: ButtonVariant = 'primary',
    className?: string
): string {
    return cn(buttonBaseClassName, variantClassNames[variant], className);
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    isLoading?: boolean;
};

/**
 * Reusable, theme-aware button. Styling rides the `foreground`/`background`
 * tokens so it swaps with light/dark automatically. `isLoading` disables the
 * button and shows a spinner before the label.
 */
export default function Button({
    variant = 'primary',
    isLoading = false,
    type = 'button',
    disabled,
    className,
    children,
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            aria-busy={isLoading}
            className={buttonClassName(variant, className)}
            {...rest}
        >
            {isLoading && <Spinner />}
            {children}
        </button>
    );
}
