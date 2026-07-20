import { cn } from '@/utils/cn';
import GridBackground from '@/components/backgrounds/GridBackground';
import Checkbox from '@/components/ui/Checkbox';
import SignalRings from '@/components/pages/network-status/SignalRings';
import NetworkStatusActions from '@/components/pages/network-status/NetworkStatusActions';
import {
    AUTO_RELOAD_LABEL,
    OFFLINE_COPY,
    OFFLINE_HEADING,
    OFFLINE_STATUS,
    RECONNECT_SCRIPT,
} from '@/components/pages/network-status/reconnect';
import { zain } from '@/config/fonts';
import styles from '@/components/pages/network-status/NetworkStatusStage/NetworkStatusStage.module.css';

/**
 * The network-status hero: a "lost signal" stage that echoes the home hero (grid
 * backdrop + display type) with an amber accent. It reacts to the network
 * returning via RECONNECT_SCRIPT (rendered inline below): the accent transitions
 * amber -> emerald, the copy updates, and an optional 5s auto-reload kicks in. The
 * script is dependency-free and drives the DOM through data attributes, so it runs
 * identically here and in the script-stripped fallback snapshot (see
 * scripts/generate-offline-fallback.ts). The initial render is the offline state;
 * the script swaps to the online state after hydration.
 */
export default function NetworkStatusStage() {
    return (
        <main
            id="main"
            data-network-root
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

            <span
                role="status"
                aria-live="polite"
                className="border-foreground/10 bg-background/60 text-foreground/70 mt-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
            >
                <span
                    aria-hidden="true"
                    className={cn(styles.dot, 'size-2 rounded-full')}
                />
                <span
                    data-network-status
                    suppressHydrationWarning
                >
                    {OFFLINE_STATUS}
                </span>
            </span>

            <h1
                data-network-title
                suppressHydrationWarning
                className="font-display mt-6 text-[length:clamp(3.5rem,17vw,9rem)] leading-[0.82] font-bold tracking-tight"
            >
                {OFFLINE_HEADING}
            </h1>

            <p
                data-network-copy
                suppressHydrationWarning
                className="text-foreground/70 mt-6 max-w-xl text-lg leading-relaxed text-balance"
            >
                {OFFLINE_COPY}
            </p>

            <NetworkStatusActions />

            <div className={cn(styles.autoReload, 'mt-6 items-center gap-2')}>
                <Checkbox
                    label={AUTO_RELOAD_LABEL}
                    data-network-autoreload
                    className="accent-[var(--network-accent)]"
                    labelClassName="text-foreground/70 hover:text-foreground/80 transition-colors"
                />
                <span
                    data-network-countdown
                    className="text-foreground/80 font-medium tabular-nums"
                />
            </div>

            {/* Reconnect behaviour, shared verbatim with the fallback snapshot. */}
            <script dangerouslySetInnerHTML={{ __html: RECONNECT_SCRIPT }} />
        </main>
    );
}
