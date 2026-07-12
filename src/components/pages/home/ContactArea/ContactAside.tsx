import { siteAuthorEmail } from '@/config/constants';
import StatusDot from '@/components/pages/home/ContactArea/StatusDot';
import {
    asideEyebrow,
    asideHeadline,
    asideBody,
    availabilityLabel,
    directEmailLead,
} from '@/components/pages/home/ContactArea/contents';

/**
 * The left rail of the contact panel: a short, human pitch plus a live status
 * cue and a direct-email fallback, so the panel reads as an invitation rather
 * than a bare form.
 */
export default function ContactAside() {
    return (
        <div className="flex flex-col gap-6 text-left">
            <div className="flex flex-col gap-3">
                <span className="text-foreground/45 text-xs font-semibold tracking-[0.22em] uppercase">
                    {asideEyebrow}
                </span>
                <p className="text-2xl leading-snug font-semibold text-balance">
                    {asideHeadline}
                </p>
                <p className="text-foreground/65 text-sm leading-relaxed">
                    {asideBody}
                </p>
            </div>

            <StatusDot label={availabilityLabel} />

            <div className="border-foreground/10 mt-auto border-t pt-5 text-sm">
                <span className="text-foreground/50">{directEmailLead}</span>
                <a
                    href={`mailto:${siteAuthorEmail}`}
                    className="decoration-emerald-500/40 hover:decoration-emerald-500 mt-1 block font-medium break-all underline underline-offset-4 transition-colors"
                >
                    {siteAuthorEmail}
                </a>
            </div>
        </div>
    );
}
