import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CodeBlockCopy from '@/components/pages/articles/CodeBlock';

const writeText = vi.fn<(text: string) => Promise<void>>();

/** The markup `markdown.ts` emits for a highlighted code block. */
function addCodeBlock(code: string): HTMLElement {
    const figure = document.createElement('figure');
    figure.className = 'code-block';
    figure.innerHTML = `
        <div class="code-block-header">
            <span>ts</span>
            <span data-code-copy></span>
        </div>
        <pre><code></code></pre>
    `;
    (figure.querySelector('code') as HTMLElement).textContent = code;
    document.body.appendChild(figure);
    return figure;
}

beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document
        .querySelectorAll('figure.code-block')
        .forEach((figure) => figure.remove());
});

async function click(button: HTMLElement) {
    await act(async () => {
        fireEvent.click(button);
        await Promise.resolve();
    });
}

describe('CodeBlockCopy', () => {
    it('renders nothing when the article has no code blocks', () => {
        const { container } = render(<CodeBlockCopy />);

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('portals a Copy button into each block header slot', () => {
        const first = addCodeBlock('const first = 1;');
        const second = addCodeBlock('const second = 2;');

        render(<CodeBlockCopy />);

        const firstSlot = first.querySelector(
            '[data-code-copy]'
        ) as HTMLElement;
        const secondSlot = second.querySelector(
            '[data-code-copy]'
        ) as HTMLElement;
        expect(
            within(firstSlot).getByRole('button', { name: 'Copy code' })
        ).toBeInTheDocument();
        expect(
            within(secondSlot).getByRole('button', { name: 'Copy code' })
        ).toBeInTheDocument();
    });

    it('copies the source of its own block', async () => {
        addCodeBlock('echo one');
        const second = addCodeBlock('pnpm build\npnpm test');
        render(<CodeBlockCopy />);

        await click(within(second).getByRole('button', { name: 'Copy code' }));

        expect(writeText).toHaveBeenCalledWith('pnpm build\npnpm test');
    });

    it('confirms with Copied, then resets after two seconds', async () => {
        const figure = addCodeBlock('ls -la');
        render(<CodeBlockCopy />);

        await click(within(figure).getByRole('button', { name: 'Copy code' }));
        const copiedButton = within(figure).getByRole('button', {
            name: 'Copied',
        });
        expect(copiedButton).toHaveTextContent('Copied');

        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(
            within(figure).getByRole('button', { name: 'Copy code' })
        ).toHaveTextContent('Copy');
    });

    it('removes the buttons on unmount', () => {
        const figure = addCodeBlock('ls');
        const { unmount } = render(<CodeBlockCopy />);

        unmount();

        expect(within(figure).queryByRole('button')).not.toBeInTheDocument();
    });
});
