'use client';

import { useState } from 'react';
import Modal from '@/components/admin/ui/Modal';
import Button from '@/components/admin/ui/Button';
import { TextField, TextAreaField } from '@/components/admin/ui/Field';
import type { DialogProps } from '@/components/admin/Editor/dialogs/types';

const LANGUAGES = [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'bash',
    'python',
    'go',
    'rust',
    'java',
    'php',
    'sql',
    'yaml',
    'html',
    'css',
    'markdown',
    'text',
];

/**
 * A GUI for code blocks: language (with suggestions), an optional file path that
 * renders in the block header, and the code itself. Emits the same
 * ``` lang path``` syntax the production renderer understands.
 */
export default function CodeDialog({
    initialText,
    initial,
    onInsert,
    onClose,
}: DialogProps) {
    const [language, setLanguage] = useState(initial?.lang ?? 'ts');
    const [filePath, setFilePath] = useState(initial?.filePath ?? '');
    const [code, setCode] = useState(initial?.code ?? initialText ?? '');

    const submit = () => {
        const info = filePath.trim()
            ? `${language.trim() || 'text'} ${filePath.trim()}`
            : language.trim() || 'text';
        onInsert('```' + info + '\n' + (code || '') + '\n```', 'block');
    };

    return (
        <Modal
            open
            onClose={onClose}
            title="Insert code block"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={submit}>
                        Insert
                    </Button>
                </>
            }
        >
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <TextField
                        label="Language"
                        value={language}
                        onChange={(event) => setLanguage(event.target.value)}
                        list="studio-code-languages"
                        placeholder="ts"
                    />
                    <datalist id="studio-code-languages">
                        {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang} />
                        ))}
                    </datalist>
                    <TextField
                        label="File path (optional)"
                        value={filePath}
                        onChange={(event) => setFilePath(event.target.value)}
                        placeholder="src/lib/posts.ts"
                    />
                </div>
                <TextAreaField
                    label="Code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    rows={8}
                    spellCheck={false}
                    placeholder="Paste your code here"
                    className="font-mono [&_textarea]:font-mono"
                />
            </div>
        </Modal>
    );
}
