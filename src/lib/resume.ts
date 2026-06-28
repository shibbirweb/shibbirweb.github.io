import fs from 'node:fs';
import path from 'node:path';

// The resume PDF is authored in `content/resume/` (single source of truth, like
// `content/articles/`). Because the site is statically exported, `content/` is
// not served to the browser, so the build step in `scripts/prepare-resume.ts`
// copies the PDF into `public/` at the path below, where the navbar links to it.
const RESUME_DIRECTORY = path.join(process.cwd(), 'content/resume');

/** Public URL of the served resume PDF (copied from `content/resume/`). */
export const resumePdfPublicPath = '/resume-shibbir-ahmed.pdf';

/** File name of the source resume PDF in `content/resume/`, or null if absent. */
export function getResumeFile(): string | null {
    if (!fs.existsSync(RESUME_DIRECTORY)) return null;
    const pdf = fs
        .readdirSync(RESUME_DIRECTORY)
        .filter((name) => name.toLowerCase().endsWith('.pdf'))
        .sort();
    return pdf[0] ?? null;
}

/** Whether a resume PDF exists; gates the navbar item and the page content. */
export function hasResume(): boolean {
    return getResumeFile() !== null;
}
