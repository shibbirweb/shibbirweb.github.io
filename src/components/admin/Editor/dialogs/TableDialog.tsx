'use client';

import { useState } from 'react';
import Modal from '@/components/admin/ui/Modal';
import Button from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import type { DialogProps } from '@/components/admin/Editor/dialogs/types';

function buildTable(rows: number, cols: number): string {
    const row = (cells: string[]) => `| ${cells.join(' | ')} |`;
    const header = row(
        Array.from({ length: cols }, (_, index) => `Column ${index + 1}`)
    );
    const separator = row(Array.from({ length: cols }, () => '---'));
    const body = Array.from({ length: rows }, () =>
        row(Array.from({ length: cols }, () => '   '))
    );
    return [header, separator, ...body].join('\n');
}

function Stepper({
    label,
    value,
    min,
    max,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{label}</span>
            <div className="border-foreground/15 flex items-center rounded-lg border">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(min, value - 1))}
                    className="hover:bg-foreground/10 grid size-9 place-items-center rounded-l-lg"
                    aria-label={`Decrease ${label}`}
                >
                    <Icon name="divider" className="size-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums">
                    {value}
                </span>
                <button
                    type="button"
                    onClick={() => onChange(Math.min(max, value + 1))}
                    className="hover:bg-foreground/10 grid size-9 place-items-center rounded-r-lg"
                    aria-label={`Increase ${label}`}
                >
                    <Icon name="plus" className="size-4" />
                </button>
            </div>
        </div>
    );
}

export default function TableDialog({ onInsert, onClose }: DialogProps) {
    const [rows, setRows] = useState(2);
    const [cols, setCols] = useState(3);

    return (
        <Modal
            open
            onClose={onClose}
            title="Insert table"
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => onInsert(buildTable(rows, cols), 'block')}
                    >
                        Insert
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <Stepper
                    label="Body rows"
                    value={rows}
                    min={1}
                    max={20}
                    onChange={setRows}
                />
                <Stepper
                    label="Columns"
                    value={cols}
                    min={1}
                    max={8}
                    onChange={setCols}
                />
                <p className="text-foreground/50 text-xs">
                    A header row is always added. Fill in the cells after
                    inserting.
                </p>
            </div>
        </Modal>
    );
}
