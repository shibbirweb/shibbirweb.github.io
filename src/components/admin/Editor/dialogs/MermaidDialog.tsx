'use client';

import { useState } from 'react';
import Modal from '@/components/admin/ui/Modal';
import Button from '@/components/admin/ui/Button';
import { SelectField } from '@/components/admin/ui/Field';
import MermaidDiagram from '@/components/pages/articles/MermaidRenderer/MermaidDiagram';
import type { DialogProps } from '@/components/admin/Editor/dialogs/types';

const TEMPLATES: Record<string, string> = {
    Flowchart: 'graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Do it]\n  B -->|No| D[Skip]',
    Sequence:
        'sequenceDiagram\n  participant U as User\n  participant S as Server\n  U->>S: Request\n  S-->>U: Response',
    Class: 'classDiagram\n  class Article {\n    +string title\n    +publish()\n  }',
};

/**
 * A Mermaid block GUI with a live, production-identical render (the same
 * MermaidDiagram used on article pages). An invalid diagram simply falls back to
 * its source, which doubles as lightweight syntax feedback.
 */
export default function MermaidDialog({
    initialText,
    initial,
    onInsert,
    onClose,
}: DialogProps) {
    const [code, setCode] = useState(
        initial?.code ?? (initialText?.trim() ? initialText : TEMPLATES.Flowchart)
    );

    return (
        <Modal
            open
            onClose={onClose}
            title="Insert Mermaid diagram"
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() =>
                            onInsert('```mermaid\n' + code.trim() + '\n```', 'block')
                        }
                    >
                        Insert
                    </Button>
                </>
            }
        >
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-3">
                    <SelectField
                        label="Start from a template"
                        onChange={(event) =>
                            event.target.value &&
                            setCode(TEMPLATES[event.target.value])
                        }
                        defaultValue=""
                    >
                        <option value="">Choose a template</option>
                        {Object.keys(TEMPLATES).map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </SelectField>
                    <textarea
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        rows={12}
                        spellCheck={false}
                        className="border-foreground/15 bg-foreground/[0.02] focus:border-violet-500 focus:ring-violet-500 w-full flex-1 rounded-lg border p-3 font-mono text-sm focus:ring-1 focus:outline-none"
                    />
                </div>
                <div>
                    <span className="text-foreground/70 mb-1.5 block text-xs font-semibold tracking-wide">
                        Live preview
                    </span>
                    <div className="border-foreground/10 overflow-hidden rounded-lg border">
                        <MermaidDiagram source={code} />
                    </div>
                </div>
            </div>
        </Modal>
    );
}
