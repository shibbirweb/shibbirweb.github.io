import Icon from '@/components/admin/ui/Icon';
import type { CommandDef } from '@/components/admin/Editor/commands';
import { cn } from '@/utils/cn';

/** The Notion-style insert menu that opens at the caret when you type "/". */
export default function SlashMenu({
    items,
    activeIndex,
    position,
    fixed = false,
    onSelect,
    onHover,
}: {
    items: CommandDef[];
    activeIndex: number;
    position: { top: number; left: number };
    /** Position relative to the viewport (for the contentEditable surface). */
    fixed?: boolean;
    onSelect: (commandId: string) => void;
    onHover: (index: number) => void;
}) {
    return (
        <div
            role="listbox"
            aria-label="Insert block"
            style={{
                position: fixed ? 'fixed' : 'absolute',
                top: position.top,
                left: position.left,
            }}
            className="bg-background z-40 max-h-72 w-72 overflow-y-auto rounded-xl border border-foreground/10 p-1 shadow-2xl"
        >
            {items.length === 0 ? (
                <p className="text-foreground/50 px-3 py-2 text-sm">
                    No matching blocks
                </p>
            ) : (
                items.map((item, index) => (
                    <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={index === activeIndex}
                        onMouseEnter={() => onHover(index)}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            onSelect(item.id);
                        }}
                        className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                            index === activeIndex
                                ? 'bg-violet-500/15'
                                : 'hover:bg-foreground/[0.06]'
                        )}
                    >
                        <span className="bg-foreground/[0.06] text-foreground/70 grid size-8 shrink-0 place-items-center rounded-md">
                            <Icon name={item.icon} className="size-4" />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                                {item.label}
                            </span>
                            <span className="text-foreground/50 block truncate text-xs">
                                {item.description}
                            </span>
                        </span>
                    </button>
                ))
            )}
        </div>
    );
}
