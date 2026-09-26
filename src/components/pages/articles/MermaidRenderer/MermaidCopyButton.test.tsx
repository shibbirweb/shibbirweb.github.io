import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MermaidCopyButton from '@/components/pages/articles/MermaidRenderer/MermaidCopyButton';

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

async function clickCopy() {
    await act(async () => {
        fireEvent.click(
            screen.getByRole('button', { name: 'Copy diagram source' })
        );
        await Promise.resolve();
    });
}

describe('MermaidCopyButton', () => {
    it('copies the mermaid source on click', async () => {
        render(<MermaidCopyButton source="flowchart LR; A-->B" />);

        await clickCopy();

        expect(writeText).toHaveBeenCalledWith('flowchart LR; A-->B');
    });

    it('confirms with a Copied label and status popup', async () => {
        render(<MermaidCopyButton source="graph" />);

        await clickCopy();

        expect(
            screen.getByRole('button', { name: 'Copied' })
        ).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Copied');
    });

    it('returns to the copy state after two seconds', async () => {
        render(<MermaidCopyButton source="graph" />);
        await clickCopy();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(
            screen.getByRole('button', { name: 'Copy diagram source' })
        ).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('shows no confirmation when the copy fails', async () => {
        writeText.mockRejectedValue(new Error('Denied'));
        render(<MermaidCopyButton source="graph" />);

        await clickCopy();

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});
