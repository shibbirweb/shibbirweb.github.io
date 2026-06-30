import Button from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';

/** Shown when the dashboard fails to load, with a retry. */
export default function ErrorState({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.04] py-20 text-center">
            <Icon name="callout" className="size-10 text-red-500/70" />
            <p className="text-foreground/70 text-sm">{message}</p>
            <Button variant="secondary" onClick={onRetry}>
                Try again
            </Button>
        </div>
    );
}
