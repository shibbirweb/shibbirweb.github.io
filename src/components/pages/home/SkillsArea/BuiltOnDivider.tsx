import { builtOnLabel } from '@/components/pages/home/SkillsArea/contents';

/**
 * The seam between the AI half and the full-stack half of the skills panel:
 * a hairline that fades from the AI violet into the neutral foundation, with
 * "Built on" in the middle, so the two halves read as one sentence ("AI
 * engineering, built on a full-stack foundation") rather than two blocks.
 */
export default function BuiltOnDivider() {
    return (
        <div className="my-10 flex items-center gap-4 sm:my-12">
            <span
                aria-hidden="true"
                className="h-px flex-1 bg-linear-to-r from-transparent to-violet-500/40"
            />
            <span className="text-foreground/55 text-xs font-semibold tracking-wider uppercase">
                {builtOnLabel}
            </span>
            <span
                aria-hidden="true"
                className="via-foreground/15 h-px flex-1 bg-linear-to-r from-violet-500/40 to-transparent"
            />
        </div>
    );
}
