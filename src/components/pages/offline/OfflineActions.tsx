import Button from '@/components/ui/Button';
import ButtonLink from '@/components/ui/ButtonLink';
import ResetIcon from '@/components/icons/reset';

/**
 * Offline page actions. "Try again" reloads the current URL (the page the user
 * was actually trying to reach) via the delegated `data-offline-reload` handler
 * in OFFLINE_RECONNECT_SCRIPT, so it works on both the hydrated route and the
 * script-stripped fallback snapshot without its own client bundle. "Back home"
 * links to the (precached) home page.
 */
export default function OfflineActions() {
    return (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
                type="button"
                data-offline-reload
            >
                <ResetIcon
                    aria-hidden="true"
                    className="size-4"
                />
                Try again
            </Button>
            <ButtonLink
                href="/"
                variant="outline"
            >
                Back home
            </ButtonLink>
        </div>
    );
}
