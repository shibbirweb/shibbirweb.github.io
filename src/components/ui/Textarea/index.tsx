import { useId } from 'react';
import { cn } from '@/utils/cn';
import { fieldControlClassName } from '@/components/ui/Input';

type TextareaProps = React.ComponentPropsWithRef<'textarea'> & {
    label: string;
    labelClassName?: string;
};

/**
 * Labeled multiline input. Reuses the shared field styling from Input plus a
 * comfortable min height and vertical resize.
 */
export default function Textarea({
    label,
    labelClassName,
    id,
    className,
    ...rest
}: TextareaProps) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
        <div className="flex flex-col gap-2 text-left">
            <label
                htmlFor={textareaId}
                className={cn('text-sm font-medium', labelClassName)}
            >
                {label}
            </label>
            <textarea
                id={textareaId}
                className={cn(fieldControlClassName, 'min-h-32 resize-y', className)}
                {...rest}
            />
        </div>
    );
}
