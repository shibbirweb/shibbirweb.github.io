'use client';

import { useState } from 'react';
import Icon from '@/components/admin/ui/Icon';
import Spinner from '@/components/admin/ui/Spinner';
import { FieldShell, CONTROL } from '@/components/admin/ui/Field';
import { uploadImage } from '@/components/admin/api';
import { coverGradientForSlug } from '@/utils/generateArticleCover';
import { cn } from '@/utils/cn';

/**
 * Cover thumbnail management: preview, upload/replace, remove, or paste a path.
 * Leaving it empty falls back to the auto-generated cover, so the field is
 * optional. Uploaded files go through the shared inline-image endpoint.
 */
export default function CoverField({
    value,
    slug,
    onChange,
}: {
    value: string | undefined;
    slug: string;
    onChange: (cover: string | undefined) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [from, to] = coverGradientForSlug(slug || 'cover');

    async function handleFile(file: File | undefined) {
        if (!file) return;
        setUploading(true);
        setFailed(false);
        try {
            const result = await uploadImage(file);
            onChange(result.path);
        } catch {
            setFailed(true);
        } finally {
            setUploading(false);
        }
    }

    return (
        <FieldShell
            label="Cover image"
            hint="Leave empty to use an auto-generated cover."
        >
            <div className="flex items-start gap-3">
                <div className="border-foreground/10 relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-lg border">
                    {value && !failed ? (
                        // eslint-disable-next-line @next/next/no-img-element -- dev-only preview of an arbitrary path
                        <img
                            src={value}
                            alt=""
                            onError={() => setFailed(true)}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div
                            className="grid h-full w-full place-items-center text-xs font-semibold text-white/80"
                            style={{
                                backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
                            }}
                        >
                            {value ? 'Not found' : 'Generated'}
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex gap-2">
                        <label className="border-foreground/15 hover:bg-foreground/[0.06] inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) =>
                                    handleFile(event.target.files?.[0])
                                }
                            />
                            {uploading ? (
                                <Spinner className="size-3.5" />
                            ) : (
                                <Icon name="image" className="size-3.5" />
                            )}
                            {value ? 'Replace' : 'Upload'}
                        </label>
                        {value && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFailed(false);
                                    onChange(undefined);
                                }}
                                className="text-foreground/50 hover:bg-foreground/[0.06] hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors"
                            >
                                <Icon name="trash" className="size-3.5" />
                                Remove
                            </button>
                        )}
                    </div>
                    <input
                        value={value ?? ''}
                        onChange={(event) => {
                            setFailed(false);
                            onChange(event.target.value || undefined);
                        }}
                        placeholder="/images/articles/my-article.svg"
                        className={cn(CONTROL, 'h-8')}
                    />
                </div>
            </div>
        </FieldShell>
    );
}
