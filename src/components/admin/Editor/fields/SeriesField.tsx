'use client';

import { Toggle } from '@/components/admin/ui/Field';

/** Optional series membership: a name (with suggestions) and a part number. */
export default function SeriesField({
    value,
    suggestions,
    onChange,
}: {
    value: { name: string; order: number } | undefined;
    suggestions: string[];
    onChange: (value: { name: string; order: number } | undefined) => void;
}) {
    return (
        <div className="space-y-3">
            <Toggle
                label="Part of a series"
                description="Group multi-part tutorials together"
                checked={Boolean(value)}
                onChange={(checked) =>
                    onChange(checked ? { name: '', order: 1 } : undefined)
                }
            />
            {value && (
                <div className="grid grid-cols-[1fr_5rem] gap-2">
                    <input
                        value={value.name}
                        onChange={(event) =>
                            onChange({ ...value, name: event.target.value })
                        }
                        placeholder="Series name"
                        list="studio-series-suggestions"
                        className="border-foreground/15 bg-foreground/[0.02] text-foreground placeholder:text-foreground/35 h-9 rounded-lg border px-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                    />
                    <datalist id="studio-series-suggestions">
                        {suggestions.map((name) => (
                            <option key={name} value={name} />
                        ))}
                    </datalist>
                    <input
                        type="number"
                        min={1}
                        value={value.order}
                        onChange={(event) =>
                            onChange({
                                ...value,
                                order: Number(event.target.value) || 1,
                            })
                        }
                        aria-label="Part number"
                        className="border-foreground/15 bg-foreground/[0.02] text-foreground h-9 rounded-lg border px-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                    />
                </div>
            )}
        </div>
    );
}
