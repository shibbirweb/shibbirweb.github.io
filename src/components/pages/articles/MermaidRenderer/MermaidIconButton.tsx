import { cn } from '@/utils/cn';

/**
 * Shared standalone control button for the Mermaid diagram overlay: a small
 * translucent, bordered square (GitHub-style) used for every control. Forwards
 * `ref` (React 19 ref-as-prop) so callers can focus it.
 */
export default function MermaidIconButton({
    className,
    type,
    ...rest
}: React.ComponentPropsWithRef<'button'>) {
    return (
        <button
            type={type ?? 'button'}
            className={cn(
                'border-foreground/10 bg-background/80 text-foreground/70 hover:bg-foreground/10 hover:text-foreground focus-visible:bg-foreground/10 focus-visible:text-foreground grid size-8 cursor-pointer place-items-center rounded-md border shadow-sm backdrop-blur transition-colors',
                className
            )}
            {...rest}
        />
    );
}
