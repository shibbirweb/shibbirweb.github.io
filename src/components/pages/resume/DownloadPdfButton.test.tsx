import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DownloadPdfButton from '@/components/pages/resume/DownloadPdfButton';

describe('DownloadPdfButton', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('opens the print dialog on click', async () => {
        const user = userEvent.setup();
        const print = vi.spyOn(window, 'print').mockImplementation(() => {});
        render(<DownloadPdfButton />);

        await user.click(screen.getByRole('button', { name: 'Download PDF' }));

        expect(print).toHaveBeenCalledTimes(1);
    });

    it('forwards the caller class', () => {
        render(<DownloadPdfButton className="print:hidden" />);

        expect(
            screen.getByRole('button', { name: 'Download PDF' })
        ).toHaveClass('print:hidden');
    });
});
