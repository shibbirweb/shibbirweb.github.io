import Menu from '@/components/icons/menu';
import Close from '@/components/icons/close';

interface MobileMenuButtonProps {
    open: boolean;
    onToggle: () => void;
}

export default function MobileMenuButton({
    open,
    onToggle,
}: MobileMenuButtonProps) {
    return (
        <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={onToggle}
            className="focus-ring border-foreground/10 bg-background/60 text-foreground/80 hover:text-foreground relative flex size-11 cursor-pointer items-center justify-center rounded-full border shadow-lg shadow-black/5 backdrop-blur-lg transition-colors"
        >
            {open ? (
                <Close
                    aria-hidden="true"
                    className="size-6"
                />
            ) : (
                <Menu
                    aria-hidden="true"
                    className="size-6"
                />
            )}
        </button>
    );
}
