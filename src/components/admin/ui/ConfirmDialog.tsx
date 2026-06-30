'use client';

import Modal from '@/components/admin/ui/Modal';
import Button, { type ButtonVariant } from '@/components/admin/ui/Button';

/** A yes/no confirmation built on Modal, for destructive or irreversible steps. */
export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmVariant = 'primary',
    busy = false,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: ButtonVariant;
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <Modal
            open={open}
            onClose={onCancel}
            title={title}
            description={description}
            size="sm"
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={busy}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        disabled={busy}
                    >
                        {busy ? 'Working...' : confirmLabel}
                    </Button>
                </>
            }
        />
    );
}
