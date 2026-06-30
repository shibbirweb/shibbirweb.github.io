export type Placement = 'inline' | 'block';

/** Pre-filled values when reopening a dialog to edit an existing block. */
export interface DialogInitial {
    lang?: string;
    filePath?: string;
    code?: string;
    url?: string;
}

/** Props every insert dialog receives from the editor. */
export interface DialogProps {
    /** The editor's current selection, for prefilling text/code fields. */
    initialText?: string;
    /** Parsed values when editing an existing block (Visual mode widgets). */
    initial?: DialogInitial;
    /** Insert the generated Markdown; the editor handles placement + closing. */
    onInsert: (markdown: string, placement?: Placement) => void;
    onClose: () => void;
}
