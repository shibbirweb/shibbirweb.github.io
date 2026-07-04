'use client';

import { useId, useState, type KeyboardEvent } from 'react';

interface TagListInputProps {
    label: string;
    values: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
    suggestions?: string[];
}

export default function TagListInput({
    label,
    values,
    onChange,
    placeholder,
    suggestions = [],
}: TagListInputProps) {
    const [input, setInput] = useState('');
    const inputId = useId();
    const listId = `${inputId}-suggestions`;

    function addValue() {
        const next = input.trim();
        if (!next) return;
        if (
            !values.some((value) => value.toLowerCase() === next.toLowerCase())
        ) {
            onChange([...values, next]);
        }
        setInput('');
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addValue();
        }
        if (event.key === 'Backspace' && !input && values.length > 0) {
            onChange(values.slice(0, -1));
        }
    }

    return (
        <div>
            <label
                className="text-sm font-medium"
                htmlFor={inputId}
            >
                {label}
            </label>
            <div className="border-foreground/15 bg-background/60 mt-2 flex min-h-11 flex-wrap items-center gap-2 rounded-xl border px-3 py-2">
                {values.map((value) => (
                    <button
                        key={value}
                        type="button"
                        className="bg-foreground/8 hover:bg-foreground/15 cursor-pointer rounded-full px-2.5 py-1 text-xs transition-colors"
                        onClick={() =>
                            onChange(values.filter((item) => item !== value))
                        }
                        aria-label={`Remove ${value}`}
                    >
                        {value} <span aria-hidden>×</span>
                    </button>
                ))}
                <input
                    id={inputId}
                    className="min-w-32 flex-1 bg-transparent py-1 text-sm outline-none"
                    value={input}
                    placeholder={
                        values.length === 0 ? placeholder : 'Add another'
                    }
                    list={suggestions.length > 0 ? listId : undefined}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addValue}
                />
                {suggestions.length > 0 && (
                    <datalist id={listId}>
                        {suggestions.map((suggestion) => (
                            <option
                                key={suggestion}
                                value={suggestion}
                            />
                        ))}
                    </datalist>
                )}
            </div>
        </div>
    );
}
