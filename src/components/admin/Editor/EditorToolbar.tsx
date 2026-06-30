import Icon, { type IconName } from '@/components/admin/ui/Icon';
import Menu, { MenuItem } from '@/components/admin/ui/Menu';
import { COMMANDS } from '@/components/admin/Editor/commands';
import { cn } from '@/utils/cn';

const INLINE_BUTTONS: { id: string; icon: IconName; title: string }[] = [
    { id: 'bold', icon: 'bold', title: 'Bold (Ctrl/Cmd + B)' },
    { id: 'italic', icon: 'italic', title: 'Italic (Ctrl/Cmd + I)' },
    { id: 'strike', icon: 'strike', title: 'Strikethrough' },
    { id: 'inlineCode', icon: 'inline-code', title: 'Inline code' },
    { id: 'highlight', icon: 'highlight', title: 'Highlight' },
    { id: 'link', icon: 'link', title: 'Link (Ctrl/Cmd + K)' },
];

const BLOCK_BUTTONS: { id: string; icon: IconName; title: string }[] = [
    { id: 'bulletList', icon: 'list', title: 'Bulleted list' },
    { id: 'numberedList', icon: 'list-ordered', title: 'Numbered list' },
    { id: 'taskList', icon: 'checklist', title: 'Checklist' },
    { id: 'quote', icon: 'quote', title: 'Quote' },
];

const INSERT_MENU = [
    'image',
    'code',
    'table',
    'mermaid',
    'gist',
    'details',
    'callout',
    'divider',
];

function ToolbarButton({
    title,
    onClick,
    children,
}: {
    title: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className="text-foreground/65 hover:bg-foreground/10 hover:text-foreground grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
        >
            {children}
        </button>
    );
}

function Divider() {
    return <span className="bg-foreground/10 mx-1 h-5 w-px shrink-0" />;
}

/** The formatting toolbar shown above the editor in Visual and Split modes. */
export default function EditorToolbar({
    onCommand,
}: {
    onCommand: (commandId: string) => void;
}) {
    return (
        <div
            className={cn(
                'border-foreground/10 bg-background/80 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b px-2 py-1.5 backdrop-blur'
            )}
        >
            <ToolbarButton title="Heading 2" onClick={() => onCommand('h2')}>
                H2
            </ToolbarButton>
            <ToolbarButton title="Heading 3" onClick={() => onCommand('h3')}>
                H3
            </ToolbarButton>
            <Divider />
            {INLINE_BUTTONS.map((button) => (
                <ToolbarButton
                    key={button.id}
                    title={button.title}
                    onClick={() => onCommand(button.id)}
                >
                    <Icon name={button.icon} className="size-4" />
                </ToolbarButton>
            ))}
            <Divider />
            {BLOCK_BUTTONS.map((button) => (
                <ToolbarButton
                    key={button.id}
                    title={button.title}
                    onClick={() => onCommand(button.id)}
                >
                    <Icon name={button.icon} className="size-4" />
                </ToolbarButton>
            ))}
            <Divider />
            <Menu
                label="Insert block"
                align="left"
                triggerIcon="plus"
                triggerClassName="size-8"
            >
                {INSERT_MENU.map((id) => {
                    const command = COMMANDS[id];
                    return (
                        <MenuItem
                            key={id}
                            icon={command.icon}
                            onClick={() => onCommand(id)}
                        >
                            {command.label}
                        </MenuItem>
                    );
                })}
            </Menu>
            <span className="text-foreground/40 ml-auto hidden px-2 text-xs sm:block">
                Type <kbd className="bg-foreground/10 rounded px-1">/</kbd> for
                commands
            </span>
        </div>
    );
}
