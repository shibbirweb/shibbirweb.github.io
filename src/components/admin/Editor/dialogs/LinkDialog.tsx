'use client';

import { useState } from 'react';
import Modal from '@/components/admin/ui/Modal';
import Button from '@/components/admin/ui/Button';
import { TextField } from '@/components/admin/ui/Field';
import type { DialogProps } from '@/components/admin/Editor/dialogs/types';

export default function LinkDialog({
    initialText,
    onInsert,
    onClose,
}: DialogProps) {
    const [text, setText] = useState(initialText ?? '');
    const [url, setUrl] = useState('');

    const submit = () => {
        const trimmed = url.trim();
        if (!trimmed) return;
        onInsert(`[${text.trim() || trimmed}](${trimmed})`, 'inline');
    };

    return (
        <Modal
            open
            onClose={onClose}
            title="Insert link"
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={submit} disabled={!url.trim()}>
                        Insert
                    </Button>
                </>
            }
        >
            <div className="space-y-3">
                <TextField
                    label="Text"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Link text"
                />
                <TextField
                    label="URL"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://example.com"
                    autoFocus
                    onKeyDown={(event) => event.key === 'Enter' && submit()}
                />
            </div>
        </Modal>
    );
}
