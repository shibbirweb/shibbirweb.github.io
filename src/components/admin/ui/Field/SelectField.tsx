import { useId } from 'react';
import FieldShell from '@/components/admin/ui/Field/FieldShell';
import { CONTROL } from '@/components/admin/ui/Field/control';
import Icon from '@/components/admin/ui/Icon';
import { cn } from '@/utils/cn';

export default function SelectField({
    label,
    hint,
    className,
    children,
    ...rest
}: {
    label?: string;
    hint?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
    const id = useId();
    return (
        <FieldShell label={label} hint={hint} htmlFor={id} className={className}>
            <div className="relative">
                <select
                    id={id}
                    className={cn(
                        CONTROL,
                        'h-10 cursor-pointer appearance-none pr-9',
                        // `color-scheme` alone does not theme the option popup on
                        // every browser; force solid, themed option colours so the
                        // dropdown stays legible in dark mode.
                        '[&>option]:bg-background [&>option]:text-foreground'
                    )}
                    {...rest}
                >
                    {children}
                </select>
                <Icon
                    name="chevron-down"
                    className="text-foreground/40 pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2"
                />
            </div>
        </FieldShell>
    );
}
