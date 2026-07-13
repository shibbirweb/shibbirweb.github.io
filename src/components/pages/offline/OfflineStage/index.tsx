import { cn } from '@/utils/cn';
import GridBackground from '@/components/backgrounds/GridBackground';
import SignalRings from '@/components/pages/offline/SignalRings';
import OfflineActions from '@/components/pages/offline/OfflineActions';
import { zain } from '@/config/fonts';
import styles from '@/components/pages/offline/OfflineStage/OfflineStage.module.css';

/**
 * The offline hero: a "lost signal" stage that echoes the home hero (grid
 * backdrop + display type) with an amber accent. Everything here is CSS-driven,
 * so it renders and animates identically in the script-stripped offline fallback
 * snapshot (see scripts/generate-offline-fallback.ts). The only scripted bit is
 * OfflineActions' reload, which the snapshot rewires via `data-offline-reload`.
 */
export default function OfflineStage() {
    return (
        <main
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
                    className="size-2 rounded-full bg-amber-500 motion-safe:animate-pulse"
                />
                No connection
            </span>

            <h1 className="font-display mt-6 text-[length:clamp(3.5rem,17vw,9rem)] leading-[0.82] font-bold tracking-tight">
                Offline
            </h1>

            <p className="text-foreground/70 mt-6 max-w-xl text-lg leading-relaxed text-balance">
                You have slipped off the grid. This page was not saved for
                offline reading, so reconnect to load it, or head back to
                somewhere you have already been.
            </p>

            <OfflineActions />
        </main>
    );
}
