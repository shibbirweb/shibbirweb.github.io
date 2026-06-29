// Build-time copy of the resume PDF into `public/`. The site is statically
// exported, so `content/` is not served; this mirrors `generate-covers.ts`.
// When `content/resume/` holds a real (non-`.example.pdf`) PDF we copy it to the
// served path so the navbar's Resume item can link to it; when only a placeholder
// (or nothing) is present we prune the public copy so the served state matches
// `hasResume()`. Runs before `next dev`/build.

import fs from 'node:fs';
import path from 'node:path';
import { getResumeFile, resumePdfPublicPath } from '@/lib/resume';

const RESUME_DIRECTORY = path.join(process.cwd(), 'content/resume');
const PUBLIC_PDF = path.join(
    process.cwd(),
    'public',
    resumePdfPublicPath.replace(/^\//, '')
);

function main(): void {
    const fileName = getResumeFile();

    if (!fileName) {
        if (fs.existsSync(PUBLIC_PDF)) fs.rmSync(PUBLIC_PDF);
        console.log('No resume PDF in content/resume/; pruned public copy.');
        return;
    }

    fs.copyFileSync(path.join(RESUME_DIRECTORY, fileName), PUBLIC_PDF);
    console.log(`Copied resume "${fileName}" into public/.`);
}

main();
