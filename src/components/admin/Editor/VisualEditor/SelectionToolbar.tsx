'use client';

import { createPortal } from 'react-dom';
import Icon, { type IconName } from '@/components/admin/ui/Icon';

type Action = { id: string; icon: IconName; title: string } | 'divider';

const ACTIONS: Action[] = [
    { id: 'bold', icon: 'bold', title: 'Bold' },
    { id: 'italic', icon: 'italic', title: 'Italic' },
    { id: 'underline', icon: 'underline', title: 'Underline' },
    { id: 'strike', icon: 'strike', title: 'Strikethrough' },
    { id: 'inlineCode', icon: 'inline-code', title: 'Inline code' },
    { id: 'highlight', icon: 'highlight', title: 'Highlight' },
    { id: 'link', icon: 'link', title: 'Link' },
    'divider',
    { id: 'h2', icon: 'heading', title: 'Heading 2' },
    { id: 'quote', icon: 'quote', title: 'Quote' },
];

/** The contextual formatting bubble shown above a text selection. */
export default function SelectionToolbar({
    rect,
    onCommand,
}: {
    rect: DOMRect;
    onCommand: (commandId: string) => void;
}) {
    if (typeof document === 'undefined') return null;
    const left = Math.min(
        Math.max(rect.left + rect.width / 2, 92),
        window.innerWidth - 92
    );

    return createPortal(
        <div
            style={{ top: rect.top - 8, left, transform: 'translate(-50%, -100%)' }}
            className="bg-background fixed z-50 flex items-center gap-0.5 rounded-lg border border-foreground/15 p-1 shadow-xl"
        >
            {ACTIONS.map((action, index) =>
                action === 'divider' ? (
                    <span
                        key={`divider-${index}`}
                        className="bg-foreground/15 mx-0.5 h-5 w-px"
                    />
                ) : (
                    <button
                        key={action.id}
                        type="button"
                        title={action.title}
                        aria-label={action.title}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            onCommand(action.id);
                        }}
                        className="text-foreground/70 hover:bg-foreground/10 hover:text-foreground grid size-7 place-items-center rounded-md transition-colors"
                    >
                        <Icon name={action.icon} className="size-4" />
                    </button>
                )
            )}
        </div>,
        document.body
    );
}
