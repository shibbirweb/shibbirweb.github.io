import { useId } from 'react';
import { cn } from '@/utils/cn';

export const fieldControlClassName =
    'border-foreground/15 bg-background/60 focus:border-foreground/40 focus:ring-foreground/20 min-h-11 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 aria-[invalid=true]:border-red-500/60 aria-[invalid=true]:focus:ring-red-500/25';

type FieldMessagesProps = {
    describedById: string;
    error?: string;
    helperText?: string;
};

/**
 * Shared helper/error region for the field primitives. The error takes over the
 * `role="alert"` (assertive) announcement when present; otherwise persistent
 * helper text is exposed as `role="status"` (polite). Both share the id the
 * control points at via `aria-describedby`.
 */
export function FieldMessages({
    describedById,
    error,
    helperText,
}: FieldMessagesProps) {
    if (error) {
        return (
            <p id={describedById} role="alert" className="text-xs text-red-600 dark:text-red-400">
                {error}
            </p>
        );
    }

    if (helperText) {
        return (
            <p
                id={describedById}
                role="status"
                className="text-foreground/70 text-xs"
            >
                {helperText}
            </p>
        );
    }

    return null;
}

/** Programmatic + visual required marker shared by the labeled field primitives. */
export function RequiredMark() {
    return (
        <span className="text-red-600 dark:text-red-400">
            <span aria-hidden="true"> *</span>
            <span className="sr-only"> (required)</span>
        </span>
    );
}

type InputProps = React.ComponentPropsWithRef<'input'> & {
    label: string;
    labelClassName?: string;
    error?: string;
    helperText?: string;
};

/**
 * Labeled text input built on the shared field styling. Theme-aware via the
 * `foreground`/`background` tokens. Forwards `ref` (React 19 ref-as-prop) so a
 * form can focus it, e.g. after a reset. When `error`/`helperText` is set, the
 * message is wired to the control via `aria-describedby` and `aria-invalid`.
 */
export default function Input({
    label,
    labelClassName,
    error,
    helperText,
    id,
    className,
    ...rest
}: InputProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedById = `${inputId}-message`;
    const hasMessage = Boolean(error || helperText);

    return (
        <div className="flex flex-col gap-2 text-left">
            <label
                htmlFor={inputId}
                className={cn('text-sm font-medium', labelClassName)}
            >
                {label}
                {rest.required && <RequiredMark />}
            </label>
            <input
                id={inputId}
                className={cn(fieldControlClassName, className)}
                aria-invalid={error ? true : undefined}
                aria-describedby={hasMessage ? describedById : undefined}
                {...rest}
            />
            <FieldMessages
                describedById={describedById}
                error={error}
                helperText={helperText}
            />
        </div>
    );
}
