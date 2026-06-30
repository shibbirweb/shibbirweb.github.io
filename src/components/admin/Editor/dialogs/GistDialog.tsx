'use client';

import { useState } from 'react';
import Modal from '@/components/admin/ui/Modal';
import Button from '@/components/admin/ui/Button';
import { TextField } from '@/components/admin/ui/Field';
import type { DialogProps } from '@/components/admin/Editor/dialogs/types';

const GIST_PATTERN = /^https:\/\/gist\.github\.com\/[\w.-]+\/[0-9a-f]+/;

/**
 * Embeds a GitHub gist. The production renderer turns a gist URL on its own line
 * into an inlined, fully-styled embed at build time, so we just drop the URL in.
 */
export default function GistDialog({ initial, onInsert, onClose }: DialogProps) {
    const [url, setUrl] = useState(initial?.url ?? '');
    const valid = GIST_PATTERN.test(url.trim());

    return (
        <Modal
            open
            onClose={onClose}
            title="Embed a GitHub gist"
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => onInsert(url.trim(), 'block')}
                        disabled={!valid}
                    >
                        Insert
                    </Button>
                </>
            }
        >
            <TextField
                label="Gist URL"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://gist.github.com/user/abc123"
                autoFocus
                hint={
                    url && !valid
                        ? 'That does not look like a gist URL.'
                        : 'The gist renders exactly as it will on the live site.'
                }
            />
        </Modal>
    );
}
