import fs from 'node:fs';
import path from 'node:path';

// The resume PDF is authored in `content/resume/` (single source of truth, like
// `content/articles/`). Because the site is statically exported, `content/` is
// not served to the browser, so the build step in `scripts/prepare-resume.ts`
// copies the PDF into `public/` at the path below, where the navbar links to it.
const RESUME_DIRECTORY = path.join(process.cwd(), 'content/resume');

// A PDF named with this suffix (e.g. `resume-shibbir-ahmed.example.pdf`) is a
// committed placeholder: it is never copied into `public/` or served, and it
// does not enable the navbar Resume item. Drop the `.example` marker (rename to
// `resume-shibbir-ahmed.pdf`) to publish the real resume. This lets the repo
// ship a sample without exposing or linking a real CV.
const EXAMPLE_SUFFIX = '.example.pdf';

/** Public URL of the served resume PDF (copied from `content/resume/`). */
export const resumePdfPublicPath = '/resume-shibbir-ahmed.pdf';

/** A real (publishable) resume PDF: a `.pdf` that is not an `.example.pdf`. */
function isPublishableResume(name: string): boolean {
    const lower = name.toLowerCase();
    return lower.endsWith('.pdf') && !lower.endsWith(EXAMPLE_SUFFIX);
}

/** File name of the source resume PDF in `content/resume/`, or null if absent. */
export function getResumeFile(): string | null {
    if (!fs.existsSync(RESUME_DIRECTORY)) return null;
    const pdf = fs
        .readdirSync(RESUME_DIRECTORY)
        .filter(isPublishableResume)
        .sort();
    return pdf[0] ?? null;
}

/** Whether a resume PDF exists; gates the navbar item and the page content. */
export function hasResume(): boolean {
    return getResumeFile() !== null;
}
