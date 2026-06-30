'use client';

import { useState } from 'react';
import Modal from '@/components/admin/ui/Modal';
import Button from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import Spinner from '@/components/admin/ui/Spinner';
import { SelectField, TextField } from '@/components/admin/ui/Field';
import { uploadImage } from '@/components/admin/api';
import { cn } from '@/utils/cn';
import type { DialogProps } from '@/components/admin/Editor/dialogs/types';

/**
 * The image block GUI: drag and drop or pick a file (uploaded into
 * public/images/articles/inline), or paste a path/URL, plus alt text, alignment,
 * and width. Without alignment/width it emits clean `![alt](src)`; with them it
 * emits an HTML <img> (which the prose pipeline renders) so styling survives.
 */
const IMAGE_PATH = /\.(png|jpe?g|gif|svg|webp|avif)$/i;

type Align = 'none' | 'left' | 'center' | 'right';

function buildImageMarkup(
    src: string,
    alt: string,
    align: Align,
    width: string
): string {
    const styles: string[] = [];
    const trimmedWidth = width.trim();
    if (trimmedWidth)
        styles.push(`width:${/^\d+$/.test(trimmedWidth) ? `${trimmedWidth}px` : trimmedWidth}`);
    if (align === 'center') styles.push('display:block', 'margin-inline:auto');
    else if (align === 'left') styles.push('float:left', 'margin:0 1rem 1rem 0');
    else if (align === 'right') styles.push('float:right', 'margin:0 0 1rem 1rem');
    if (styles.length === 0) return `![${alt}](${src})`;
    return `<img src="${src}" alt="${alt}" style="${styles.join(';')}" />`;
}

export default function ImageDialog({
    initialText,
    onInsert,
    onClose,
}: DialogProps) {
    const [path, setPath] = useState(
        initialText && IMAGE_PATH.test(initialText.trim()) ? initialText.trim() : ''
    );
    const [alt, setAlt] = useState('');
    const [align, setAlign] = useState<Align>('none');
    const [width, setWidth] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const [previewFailed, setPreviewFailed] = useState(false);

    async function handleFile(file: File | undefined) {
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const result = await uploadImage(file);
            setPreviewFailed(false);
            setPath(result.path);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    }

    return (
        <Modal
            open
            onClose={onClose}
            title="Insert image"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() =>
                            onInsert(
                                buildImageMarkup(
                                    path.trim(),
                                    alt.trim(),
                                    align,
                                    width
                                ),
                                'block'
                            )
                        }
                        disabled={!path.trim()}
                    >
                        Insert
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <label
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        handleFile(event.dataTransfer.files[0]);
                    }}
                    className={cn(
                        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors',
                        dragging
                            ? 'border-violet-500 bg-violet-500/[0.06]'
                            : 'border-foreground/20 hover:border-foreground/40'
                    )}
                >
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleFile(event.target.files?.[0])}
                    />
                    {uploading ? (
                        <Spinner className="size-5" />
                    ) : (
                        <Icon name="image" className="text-foreground/40 size-7" />
                    )}
                    <span className="text-foreground/60 text-sm">
                        {uploading
                            ? 'Uploading...'
                            : 'Drop an image here, or click to choose'}
                    </span>
                    <span className="text-foreground/40 text-xs">
                        Saved to public/images/articles/inline
                    </span>
                </label>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <TextField
                    label="Image path or URL"
                    value={path}
                    onChange={(event) => {
                        setPreviewFailed(false);
                        setPath(event.target.value);
                    }}
                    placeholder="/images/articles/inline/diagram.svg"
                />

                {path &&
                    (previewFailed ? (
                        <p className="text-foreground/50 text-xs">
                            Could not load a preview for this path.
                        </p>
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- dev-only preview of an arbitrary path
                        <img
                            src={path}
                            alt=""
                            onError={() => setPreviewFailed(true)}
                            className="border-foreground/10 max-h-48 w-full rounded-lg border object-contain"
                        />
                    ))}

                <TextField
                    label="Alt text (also used as the caption)"
                    value={alt}
                    onChange={(event) => setAlt(event.target.value)}
                    placeholder="Describe the image for screen readers"
                />

                <div className="grid grid-cols-2 gap-3">
                    <SelectField
                        label="Alignment"
                        value={align}
                        onChange={(event) => setAlign(event.target.value as Align)}
                    >
                        <option value="none">Default</option>
                        <option value="left">Float left</option>
                        <option value="center">Center</option>
                        <option value="right">Float right</option>
                    </SelectField>
                    <TextField
                        label="Width (optional)"
                        value={width}
                        onChange={(event) => setWidth(event.target.value)}
                        placeholder="e.g. 320 or 50%"
                    />
                </div>
                <p className="text-foreground/45 text-xs">
                    Alignment or width emit an HTML image; otherwise the output
                    stays clean Markdown.
                </p>
            </div>
        </Modal>
    );
}
