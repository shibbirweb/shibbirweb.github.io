import { cn } from '@/utils/cn';
import GridBackground from '@/components/backgrounds/GridBackground';
import SignalRings from '@/components/pages/offline/SignalRings';
import OfflineActions from '@/components/pages/offline/OfflineActions';
import {
    AUTO_RELOAD_LABEL,
    OFFLINE_COPY,
    OFFLINE_HEADING,
    OFFLINE_RECONNECT_SCRIPT,
    OFFLINE_STATUS,
} from '@/components/pages/offline/offlineReconnect';
import { zain } from '@/config/fonts';
import styles from '@/components/pages/offline/OfflineStage/OfflineStage.module.css';

/**
 * The offline hero: a "lost signal" stage that echoes the home hero (grid
 * backdrop + display type) with an amber accent. It reacts to the network
 * returning via OFFLINE_RECONNECT_SCRIPT (rendered inline below): the accent
 * transitions amber -> emerald, the copy updates, and an optional 5s auto-reload
 * kicks in. The script is dependency-free and drives the DOM through data
 * attributes, so it runs identically here and in the script-stripped fallback
 * snapshot (see scripts/generate-offline-fallback.ts). The initial render is the
 * offline state; the script swaps to the online state after hydration.
 */
export default function OfflineStage() {
    return (
        <main
            data-offline-root
            data-status="offline"
            // The reconnect script may flip data-status (and the text below) to the
            // online state before React hydrates when the device is already online,
            // so suppress the hydration diff on the nodes it mutates, mirroring the
            // pre-paint theme script on <html> in the root layout. Without JS the
            // SSR offline state stands.
            suppressHydrationWarning
            className={cn(
                styles.stage,
                zain.variable,
                'relative isolate flex grow flex-col items-center justify-center overflow-hidden px-4 py-20 text-center'
            )}
        >
            <GridBackground className="opacity-60" />

            <SignalRings />

            <span className="border-foreground/10 bg-background/60 text-foreground/70 mt-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                <span
                    aria-hidden="true"
                    className={cn(styles.dot, 'size-2 rounded-full')}
                />
                <span
                    data-offline-status
                    suppressHydrationWarning
                >
                    {OFFLINE_STATUS}
                </span>
            </span>

            <h1
                data-offline-title
                suppressHydrationWarning
                className="font-display mt-6 text-[length:clamp(3.5rem,17vw,9rem)] leading-[0.82] font-bold tracking-tight"
            >
                {OFFLINE_HEADING}
            </h1>

            <p
                data-offline-copy
                suppressHydrationWarning
                className="text-foreground/70 mt-6 max-w-xl text-lg leading-relaxed text-balance"
            >
                {OFFLINE_COPY}
            </p>

            <OfflineActions />

            <label
                className={cn(
                    styles.autoReload,
                    'text-foreground/60 hover:text-foreground/80 mt-6 cursor-pointer items-center gap-2 text-sm transition-colors'
                )}
            >
                <input
                    type="checkbox"
                    data-offline-autoreload
                    className={cn(styles.checkbox, 'size-4 rounded')}
                />
                {AUTO_RELOAD_LABEL}
                <span
                    data-offline-countdown
                    className="text-foreground/80 font-medium tabular-nums"
                />
            </label>

            {/* Reconnect behaviour, shared verbatim with the fallback snapshot. */}
            <script dangerouslySetInnerHTML={{ __html: OFFLINE_RECONNECT_SCRIPT }} />
        </main>
    );
}
