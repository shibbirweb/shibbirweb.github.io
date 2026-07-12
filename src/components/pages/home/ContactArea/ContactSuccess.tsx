import CheckIcon from '@/components/icons/check';
import Button from '@/components/ui/Button';
import {
    resendLabel,
    successSubtitle,
    successTitle,
} from '@/components/pages/home/ContactArea/contents';

/**
 * Success state shown after a message is delivered: a green tick, a short
 * confirmation, and a "Resend again" action that clears the form for reuse.
 */
export default function ContactSuccess({
    onResend,
}: {
    onResend: () => void;
}) {
    return (
        <div
            role="status"
            className="border-foreground/10 bg-background/40 flex flex-col items-center gap-4 rounded-2xl border px-6 py-10 text-center"
        >
            <span className="flex size-14 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                <CheckIcon className="size-7" />
            </span>
            <div>
                <p className="text-lg font-semibold">{successTitle}</p>
                <p className="text-foreground/70 mt-1 text-sm">
                    {successSubtitle}
                </p>
            </div>
            <Button
                variant="outline"
                onClick={onResend}
            >
                {resendLabel}
            </Button>
        </div>
    );
}
