'use client';

import LinkDialog from '@/components/admin/Editor/dialogs/LinkDialog';
import ImageDialog from '@/components/admin/Editor/dialogs/ImageDialog';
import CodeDialog from '@/components/admin/Editor/dialogs/CodeDialog';
import TableDialog from '@/components/admin/Editor/dialogs/TableDialog';
import MermaidDialog from '@/components/admin/Editor/dialogs/MermaidDialog';
import GistDialog from '@/components/admin/Editor/dialogs/GistDialog';
import type {
    DialogInitial,
    DialogProps,
} from '@/components/admin/Editor/dialogs/types';
import type { DialogKind } from '@/components/admin/Editor/commands';

const DIALOGS: Record<DialogKind, (props: DialogProps) => React.ReactNode> = {
    link: LinkDialog,
    image: ImageDialog,
    code: CodeDialog,
    table: TableDialog,
    mermaid: MermaidDialog,
    gist: GistDialog,
};

/** Renders whichever insert dialog is active, or nothing. */
export default function InsertDialogs({
    kind,
    initialText,
    initial,
    onInsert,
    onClose,
}: {
    kind: DialogKind | null;
    initialText?: string;
    initial?: DialogInitial;
    onInsert: DialogProps['onInsert'];
    onClose: () => void;
}) {
    if (!kind) return null;
    const Dialog = DIALOGS[kind];
    return (
        <Dialog
            initialText={initialText}
            initial={initial}
            onInsert={onInsert}
            onClose={onClose}
        />
    );
}
