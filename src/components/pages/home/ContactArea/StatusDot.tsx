/**
 * A small emerald status dot with a soft pulsing halo, paired with a label. Used
 * in the contact aside to give the panel a quiet sense of liveliness.
 */
export default function StatusDot({ label }: { label: string }) {
    return (
        <span className="text-foreground/60 inline-flex items-center gap-2.5 text-sm">
            <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full rounded-full bg-emerald-500/70 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            {label}
        </span>
    );
}
