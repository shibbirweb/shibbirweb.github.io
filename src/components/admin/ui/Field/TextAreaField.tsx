import { useId } from 'react';
import FieldShell from '@/components/admin/ui/Field/FieldShell';
import { CONTROL } from '@/components/admin/ui/Field/control';
import { cn } from '@/utils/cn';

export default function TextAreaField({
    label,
    hint,
    className,
    ...rest
}: {
    label?: string;
    hint?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    const id = useId();
    return (
        <FieldShell label={label} hint={hint} htmlFor={id} className={className}>
            <textarea
                id={id}
                className={cn(CONTROL, 'py-2 leading-relaxed')}
                {...rest}
            />
        </FieldShell>
    );
}
