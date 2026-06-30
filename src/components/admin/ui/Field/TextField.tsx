import { useId } from 'react';
import FieldShell from '@/components/admin/ui/Field/FieldShell';
import { CONTROL } from '@/components/admin/ui/Field/control';
import { cn } from '@/utils/cn';

export default function TextField({
    label,
    hint,
    className,
    ...rest
}: {
    label?: string;
    hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    const id = useId();
    return (
        <FieldShell label={label} hint={hint} htmlFor={id} className={className}>
            <input id={id} className={cn(CONTROL, 'h-10')} {...rest} />
        </FieldShell>
    );
}
