import { Facet } from '@/components/pages/home/AboutMeArea/contents';
import { cn } from '@/utils/cn';

// One facet card: an accent-dotted title and a one-line statement. Opaque so the
// desktop connector line tucks behind it; with `glow` it grows a soft accent
// corner wash (the project-card glow language) for the bento layout.
export default function FacetCard({
    facet,
    className,
    glow = false,
}: {
    facet: Facet;
    className?: string;
    glow?: boolean;
}) {
    return (
        <div
            className={cn(
                'border-foreground/10 bg-background relative z-10 overflow-hidden rounded-2xl border p-5 shadow-sm',
                facet.placementClassName,
                className
            )}
        >
            {glow ? (
                <span
                    aria-hidden
                    className="pointer-events-none absolute -top-6 -right-6 size-20 rounded-full opacity-25 blur-2xl"
                    style={{ backgroundColor: facet.accent }}
                />
            ) : null}

            <div className="relative">
                <div className="flex items-center gap-2">
                    <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: facet.accent }}
                    />
                    <h3 className="font-semibold">{facet.title}</h3>
                </div>
                <p className="text-foreground/60 mt-2 text-sm leading-relaxed">
                    {facet.text}
                </p>
            </div>
        </div>
    );
}
