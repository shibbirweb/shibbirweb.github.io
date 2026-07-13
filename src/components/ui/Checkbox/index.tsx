import { cn } from '@/utils/cn';

type CheckboxProps = React.ComponentPropsWithRef<'input'> & {
    label: string;
    labelClassName?: string;
};

/**
 * Labeled checkbox on the `foreground` accent token. The label wraps the input so
 * the whole row is clickable; `data-*` and every other input prop is forwarded.
 * Pass an `accent-[...]` utility via `className` to override the accent colour.
 */
export default function Checkbox({
    label,
    labelClassName,
    className,
    ...rest
}: CheckboxProps) {
    return (
        <label
            className={cn(
                'inline-flex cursor-pointer items-center gap-2 text-sm',
                labelClassName
            )}
        >
            <input
                type="checkbox"
                className={cn('accent-foreground size-4 rounded', className)}
                {...rest}
            />
            {label}
        </label>
    );
}
