import type { IconName } from '@/components/admin/ui/Icon';
import {
    bulletList,
    heading,
    inline,
    insertBlock,
    numberedList,
    quote,
    surround,
    taskList,
    type EditorState,
} from '@/components/admin/Editor/markdown';

/** Block insert forms that need extra input open one of these dialogs. */
export type DialogKind = 'link' | 'image' | 'code' | 'table' | 'mermaid' | 'gist';

export interface CommandDef {
    id: string;
    label: string;
    description: string;
    icon: IconName;
    keywords: string[];
    /** A pure transform applied immediately, or... */
    run?: (state: EditorState) => EditorState;
    /** ...a dialog to gather input before inserting. */
    dialog?: DialogKind;
}

export const DETAILS_TEMPLATE = `<details>
<summary>Summary</summary>

Hidden content goes here.

</details>`;

/** Every editor command, keyed by id. */
export const COMMANDS: Record<string, CommandDef> = {
    h2: {
        id: 'h2',
        label: 'Heading 2',
        description: 'Section heading',
        icon: 'heading',
        keywords: ['h2', 'heading', 'title', 'section'],
        run: (state) => heading(state, 2),
    },
    h3: {
        id: 'h3',
        label: 'Heading 3',
        description: 'Subsection heading',
        icon: 'heading',
        keywords: ['h3', 'heading', 'subsection'],
        run: (state) => heading(state, 3),
    },
    bulletList: {
        id: 'bulletList',
        label: 'Bulleted list',
        description: 'A simple bullet list',
        icon: 'list',
        keywords: ['bullet', 'list', 'unordered', 'ul'],
        run: bulletList,
    },
    numberedList: {
        id: 'numberedList',
        label: 'Numbered list',
        description: 'An ordered list',
        icon: 'list-ordered',
        keywords: ['numbered', 'ordered', 'list', 'ol'],
        run: numberedList,
    },
    taskList: {
        id: 'taskList',
        label: 'Checklist',
        description: 'A list with checkboxes',
        icon: 'checklist',
        keywords: ['task', 'todo', 'checklist', 'checkbox'],
        run: taskList,
    },
    quote: {
        id: 'quote',
        label: 'Quote',
        description: 'A block quotation',
        icon: 'quote',
        keywords: ['quote', 'blockquote', 'citation'],
        run: quote,
    },
    callout: {
        id: 'callout',
        label: 'Callout',
        description: 'A highlighted note',
        icon: 'callout',
        keywords: ['callout', 'note', 'warning', 'tip', 'info'],
        run: (state) => insertBlock(state, '> **Note:** $0'),
    },
    divider: {
        id: 'divider',
        label: 'Divider',
        description: 'A horizontal rule',
        icon: 'divider',
        keywords: ['divider', 'rule', 'hr', 'separator'],
        run: (state) => insertBlock(state, '---'),
    },
    details: {
        id: 'details',
        label: 'Details / Accordion',
        description: 'A collapsible section',
        icon: 'details',
        keywords: ['details', 'accordion', 'collapse', 'expand', 'toggle'],
        run: (state) => insertBlock(state, DETAILS_TEMPLATE),
    },
    table: {
        id: 'table',
        label: 'Table',
        description: 'Insert a table',
        icon: 'table',
        keywords: ['table', 'grid', 'rows', 'columns'],
        dialog: 'table',
    },
    image: {
        id: 'image',
        label: 'Image',
        description: 'Upload or link an image',
        icon: 'image',
        keywords: ['image', 'picture', 'photo', 'upload'],
        dialog: 'image',
    },
    code: {
        id: 'code',
        label: 'Code block',
        description: 'Syntax-highlighted code',
        icon: 'code',
        keywords: ['code', 'snippet', 'pre', 'syntax'],
        dialog: 'code',
    },
    mermaid: {
        id: 'mermaid',
        label: 'Mermaid diagram',
        description: 'A diagram from text',
        icon: 'diagram',
        keywords: ['mermaid', 'diagram', 'flowchart', 'graph', 'sequence'],
        dialog: 'mermaid',
    },
    gist: {
        id: 'gist',
        label: 'GitHub Gist',
        description: 'Embed a gist',
        icon: 'github',
        keywords: ['gist', 'github', 'embed', 'snippet'],
        dialog: 'gist',
    },
    link: {
        id: 'link',
        label: 'Link',
        description: 'Insert a hyperlink',
        icon: 'link',
        keywords: ['link', 'url', 'href', 'anchor'],
        dialog: 'link',
    },
};

/** Inline formatting actions for the toolbar and selection bubble. */
export const INLINE_COMMANDS: {
    id: string;
    label: string;
    icon: IconName;
    shortcut?: string;
    run: (state: EditorState) => EditorState;
}[] = [
    { id: 'bold', label: 'Bold', icon: 'bold', shortcut: 'Ctrl B', run: (s) => inline(s, '**', 'bold text') },
    { id: 'italic', label: 'Italic', icon: 'italic', shortcut: 'Ctrl I', run: (s) => inline(s, '_', 'italic text') },
    { id: 'strike', label: 'Strikethrough', icon: 'strike', run: (s) => inline(s, '~~', 'struck text') },
    { id: 'inlineCode', label: 'Inline code', icon: 'inline-code', run: (s) => inline(s, '`', 'code') },
    { id: 'highlight', label: 'Highlight', icon: 'highlight', run: (s) => surround(s, '<mark>', '</mark>', 'highlight') },
    { id: 'underline', label: 'Underline', icon: 'underline', run: (s) => surround(s, '<u>', '</u>', 'underline') },
];

/** Slash-menu groupings, in display order. */
export const SLASH_GROUPS: { label: string; commandIds: string[] }[] = [
    {
        label: 'Basic',
        commandIds: [
            'h2',
            'h3',
            'bulletList',
            'numberedList',
            'taskList',
            'quote',
            'callout',
            'divider',
        ],
    },
    {
        label: 'Media & embeds',
        commandIds: ['image', 'code', 'mermaid', 'gist', 'table', 'details'],
    },
];

/** Every slash-insertable command, flattened in display order. */
export const SLASH_COMMANDS: CommandDef[] = SLASH_GROUPS.flatMap((group) =>
    group.commandIds.map((id) => COMMANDS[id])
);

/** Filter the slash commands by a query against labels and keywords. */
export function filterSlashCommands(query: string): CommandDef[] {
    if (!query) return SLASH_COMMANDS;
    const needle = query.toLowerCase();
    return SLASH_COMMANDS.filter(
        (command) =>
            command.label.toLowerCase().includes(needle) ||
            command.keywords.some((keyword) => keyword.includes(needle))
    );
}
