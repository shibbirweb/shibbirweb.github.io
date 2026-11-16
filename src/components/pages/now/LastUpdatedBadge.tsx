/** The "Last updated June 2026" pill with a softly pulsing green dot. */
export default function LastUpdatedBadge({ label }: { label: string }) {
    return (
        <p className="border-foreground/10 text-foreground/70 inline-flex shrink-0 items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-3 text-sm">
            <span
                aria-hidden="true"
                className="relative grid size-2 place-items-center"
            >
                <span className="absolute size-2 rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />
                <span className="size-2 rounded-full bg-emerald-500" />
            </span>
            Last updated{' '}
            <time className="text-foreground/85 font-semibold">{label}</time>
        </p>
    );
}
