import { describe, expect, it } from 'vitest';
import {
    resumeHeadline,
    resumeName,
    resumeSections,
} from '@/app/resume/contents';
import { loadPage } from '@tests/build/helpers';

// The resume ships two layouts from the same data: the framed screen card and
// the classic one-column CV that "Download PDF" prints. Both must be in the
// exported HTML, each hidden in the other medium.
describe('resume page layouts', () => {
    const document = loadPage('resume.html');
    const screenCard = document.querySelector('[data-testid="resume-screen"]');
    const printLayout = document.querySelector('[data-testid="resume-print"]');

    it('ships the screen card, hidden in print', () => {
        expect(screenCard).not.toBeNull();
        expect(screenCard!.classList).toContain('print:hidden');
    });

    it('ships the print layout, hidden on screen', () => {
        expect(printLayout).not.toBeNull();
        expect(printLayout!.classList).toContain('hidden');
        expect(printLayout!.classList).toContain('print:block');
    });

    it('prints the name and headline at the top', () => {
        expect(
            printLayout!.querySelector('header > p:first-child')?.textContent
        ).toBe(resumeName);
        expect(printLayout!.querySelector('header')?.textContent).toContain(
            resumeHeadline
        );
    });

    it('prints every section in content order', () => {
        const labels = [...printLayout!.querySelectorAll('h2')].map(
            (heading) => heading.textContent
        );
        expect(labels).toEqual(resumeSections.map((section) => section.label));
    });
});
