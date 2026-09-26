import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import * as realResume from '@/lib/resume';

describe('resume against the real content/resume directory', () => {
    it('ignores the committed .example.pdf placeholder', () => {
        expect(realResume.getResumeFile()).toBeNull();
        expect(realResume.hasResume()).toBe(false);
    });

    it('serves the resume from a fixed public path', () => {
        expect(realResume.resumePdfPublicPath).toBe(
            '/resume-shibbir-ahmed.pdf'
        );
    });
});

describe('resume against a fixture directory', () => {
    let fixtureRoot: string;
    let resumeDirectory: string;
    let resume: typeof realResume;

    /** Replace the fixture resume directory with exactly these (empty) files. */
    function writeResumeFiles(fileNames: string[]): void {
        fs.rmSync(resumeDirectory, { recursive: true, force: true });
        fs.mkdirSync(resumeDirectory, { recursive: true });
        for (const fileName of fileNames) {
            fs.writeFileSync(path.join(resumeDirectory, fileName), '');
        }
    }

    beforeAll(async () => {
        fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'resume-test-'));
        resumeDirectory = path.join(fixtureRoot, 'content/resume');

        // resume.ts resolves its directory from process.cwd() at import time.
        vi.spyOn(process, 'cwd').mockReturnValue(fixtureRoot);
        vi.resetModules();
        resume = await import('@/lib/resume');
    });

    afterAll(() => {
        fs.rmSync(fixtureRoot, { recursive: true, force: true });
    });

    beforeEach(() => {
        writeResumeFiles([]);
    });

    it('returns null when the resume directory is missing', () => {
        fs.rmSync(resumeDirectory, { recursive: true, force: true });

        expect(resume.getResumeFile()).toBeNull();
        expect(resume.hasResume()).toBe(false);
    });

    it('returns null when only an .example.pdf is present, in any case', () => {
        writeResumeFiles([
            'resume.example.pdf',
            'other.EXAMPLE.PDF',
            'notes.txt',
        ]);

        expect(resume.getResumeFile()).toBeNull();
    });

    it('picks a real PDF and ignores the example beside it', () => {
        writeResumeFiles([
            'resume-shibbir-ahmed.example.pdf',
            'resume-shibbir-ahmed.pdf',
        ]);

        expect(resume.getResumeFile()).toBe('resume-shibbir-ahmed.pdf');
        expect(resume.hasResume()).toBe(true);
    });

    it('accepts an upper-case .PDF extension', () => {
        writeResumeFiles(['CV.PDF']);

        expect(resume.getResumeFile()).toBe('CV.PDF');
    });

    it('picks the alphabetically first PDF when several exist', () => {
        writeResumeFiles(['b-resume.pdf', 'a-resume.pdf']);

        expect(resume.getResumeFile()).toBe('a-resume.pdf');
    });
});
