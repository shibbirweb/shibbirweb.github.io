import { useId } from 'react';
import { cn } from '@/utils/cn';
import {
    fieldControlClassName,
    FieldMessages,
    RequiredMark,
} from '@/components/ui/Input';

type TextareaProps = React.ComponentPropsWithRef<'textarea'> & {
    label: string;
    labelClassName?: string;
    error?: string;
    helperText?: string;
};

/**
 * Labeled multiline input. Reuses the shared field styling, required marker, and
 * error/helper wiring from Input plus a comfortable min height and vertical
 * resize.
 */
export default function Textarea({
    label,
    labelClassName,
    error,
    helperText,
    id,
    className,
    ...rest
}: TextareaProps) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const describedById = `${textareaId}-message`;
    const hasMessage = Boolean(error || helperText);

    return (
        <div className="flex flex-col gap-2 text-left">
            <label
                htmlFor={textareaId}
                className={cn('text-sm font-medium', labelClassName)}
            >
                {label}
                {rest.required && <RequiredMark />}
            </label>
            <textarea
                id={textareaId}
                className={cn(fieldControlClassName, 'min-h-32 resize-y', className)}
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
