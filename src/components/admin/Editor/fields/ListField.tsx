'use client';

import Icon from '@/components/admin/ui/Icon';
import { FieldShell } from '@/components/admin/ui/Field';

/**
 * An editable list of short text lines, used for the "What you'll learn"
 * takeaways. Add, edit, and remove rows; empty rows are dropped on save.
 */
export default function ListField({
    label,
    hint,
    value,
    onChange,
    placeholder = 'Add an item',
}: {
    label?: string;
    hint?: string;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}) {
    const update = (index: number, text: string) =>
        onChange(value.map((item, position) => (position === index ? text : item)));
    const remove = (index: number) =>
        onChange(value.filter((_, position) => position !== index));
    const add = () => onChange([...value, '']);

    return (
        <FieldShell label={label} hint={hint}>
            <div className="space-y-2">
                {value.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            value={item}
                            onChange={(event) => update(index, event.target.value)}
                            placeholder={placeholder}
                            className="border-foreground/15 bg-foreground/[0.02] text-foreground placeholder:text-foreground/35 h-9 flex-1 rounded-lg border px-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            aria-label="Remove item"
                            className="text-foreground/40 hover:bg-foreground/10 hover:text-foreground grid size-9 shrink-0 place-items-center rounded-lg"
                        >
                            <Icon name="close" className="size-4" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={add}
                    className="text-foreground/60 hover:text-foreground flex items-center gap-1.5 text-sm font-medium"
                >
                    <Icon name="plus" className="size-4" />
                    Add item
                </button>
            </div>
        </FieldShell>
    );
}
