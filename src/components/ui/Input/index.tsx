import { useId } from 'react';
import { cn } from '@/utils/cn';

export const fieldControlClassName =
    'border-foreground/15 bg-background/60 focus:border-foreground/40 focus:ring-foreground/20 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2';

type InputProps = React.ComponentPropsWithRef<'input'> & {
    label: string;
    labelClassName?: string;
};

/**
 * Labeled text input built on the shared field styling. Theme-aware via the
 * `foreground`/`background` tokens. Forwards `ref` (React 19 ref-as-prop) so a
 * form can focus it, e.g. after a reset.
 */
export default function Input({
    label,
    labelClassName,
    id,
    className,
    ...rest
}: InputProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <div className="flex flex-col gap-2 text-left">
            <label
                htmlFor={inputId}
                className={cn('text-sm font-medium', labelClassName)}
            >
                {label}
            </label>
            <input
                id={inputId}
                className={cn(fieldControlClassName, className)}
                {...rest}
            />
        </div>
    );
}
