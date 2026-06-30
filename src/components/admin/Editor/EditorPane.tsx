'use client';

/**
 * The writing column: a prominent title field over an editor surface (the
 * WYSIWYG Visual editor or the raw Markdown editor). Shared by Visual and
 * Markdown modes (full width) and the left half of Split mode.
 */
export default function EditorPane({
    title,
    onTitleChange,
    slug,
    onOpenDetails,
    children,
}: {
    title: string;
    onTitleChange: (title: string) => void;
    slug: string;
    onOpenDetails: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col">
            <div className="border-foreground/10 min-w-0 border-b px-4 pt-5 pb-3 sm:px-6">
                <input
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value)}
                    placeholder="Article title"
                    aria-label="Article title"
                    className="text-foreground placeholder:text-foreground/30 w-full bg-transparent text-2xl font-bold outline-none sm:text-3xl"
                />
                <button
                    type="button"
                    onClick={onOpenDetails}
                    className="text-foreground/45 hover:text-foreground/75 mt-1.5 block max-w-full truncate font-mono text-xs transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
                >
                    /{slug || 'untitled'} · edit details
                </button>
            </div>
            {children}
        </div>
    );
}
