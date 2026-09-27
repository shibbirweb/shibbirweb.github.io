import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MermaidRenderer from '@/components/pages/articles/MermaidRenderer';

const mermaidMock = vi.hoisted(() => ({
    initialize: vi.fn(),
    render: vi.fn(),
}));

vi.mock('mermaid', () => ({ default: mermaidMock }));

function addMermaidBlock(source: string): HTMLPreElement {
    const block = document.createElement('pre');
    block.className = 'mermaid';
    block.textContent = source;
    document.body.appendChild(block);
    return block;
}

// Diagrams only load mermaid once they near the viewport. This observer
// reports every placeholder as near as soon as it is watched, unless a test
// holds it back with `nearViewport.hold()`.
const nearViewport = vi.hoisted(() => {
    const pending: (() => void)[] = [];
    let held = false;
    return {
        hold: () => {
            held = true;
        },
        release: () => {
            held = false;
            pending.splice(0).forEach((report) => report());
        },
        watch: (report: () => void) => {
            if (held) {
                pending.push(report);
                return;
            }
            report();
        },
        reset: () => {
            held = false;
            pending.length = 0;
        },
    };
});

class ReportingIntersectionObserver {
    constructor(private callback: IntersectionObserverCallback) {}
    observe(element: Element) {
        nearViewport.watch(() =>
            this.callback(
                [
                    {
                        isIntersecting: true,
                        target: element,
                    } as unknown as IntersectionObserverEntry,
                ],
                this as unknown as IntersectionObserver
            )
        );
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
}

beforeEach(() => {
    nearViewport.reset();
    vi.stubGlobal('IntersectionObserver', ReportingIntersectionObserver);
    mermaidMock.initialize.mockReset();
    mermaidMock.render.mockReset();
    mermaidMock.render.mockResolvedValue({
        svg: '<svg data-testid="rendered-diagram" style="max-width: 320px;"></svg>',
    });
});

afterEach(() => {
    document.querySelectorAll('pre.mermaid').forEach((block) => block.remove());
    vi.unstubAllGlobals();
});

describe('MermaidRenderer', () => {
    it('renders nothing of its own when there are no diagrams', () => {
        const { container } = render(<MermaidRenderer />);

        expect(container).toBeEmptyDOMElement();
        expect(mermaidMock.render).not.toHaveBeenCalled();
    });

    it('waits for the diagram to near the viewport before loading mermaid', async () => {
        nearViewport.hold();
        addMermaidBlock('graph TD; A-->B');

        render(<MermaidRenderer />);

        expect(
            await screen.findByLabelText('Diagram source')
        ).toHaveTextContent('graph TD; A-->B');
        expect(mermaidMock.render).not.toHaveBeenCalled();

        act(() => nearViewport.release());

        expect(
            await screen.findByTestId('rendered-diagram')
        ).toBeInTheDocument();
        expect(mermaidMock.render).toHaveBeenCalledTimes(1);
    });

    it('renders the diagram into the host beside the hidden source block', async () => {
        const block = addMermaidBlock('graph TD; A-->B');

        render(<MermaidRenderer />);

        const diagram = await screen.findByTestId('rendered-diagram');
        expect(block.style.display).toBe('none');
        expect(block.nextElementSibling).toContainElement(diagram);
        expect(mermaidMock.render).toHaveBeenCalledWith(
            expect.any(String),
            'graph TD; A-->B'
        );
    });

    it('strips mermaid fixed max-width so the stage can scale the svg', async () => {
        addMermaidBlock('graph TD; A-->B');

        render(<MermaidRenderer />);

        const diagram = await screen.findByTestId('rendered-diagram');
        expect(diagram.getAttribute('style') ?? '').not.toContain('max-width');
    });

    it('offers full view and copy controls on each diagram', async () => {
        addMermaidBlock('graph TD; A-->B');

        render(<MermaidRenderer />);

        expect(
            await screen.findByRole('button', { name: 'Full view' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Copy diagram source' })
        ).toBeInTheDocument();
    });

    it('falls back to the plain source when mermaid cannot render it', async () => {
        mermaidMock.render.mockRejectedValue(new Error('Parse error'));
        const block = addMermaidBlock('not a diagram');

        render(<MermaidRenderer />);

        await waitFor(() => {
            expect(mermaidMock.render).toHaveBeenCalled();
        });
        const host = block.nextElementSibling as HTMLElement;
        expect(host.querySelector('pre')).toHaveTextContent('not a diagram');
        expect(screen.queryByRole('button', { name: 'Full view' })).toBeNull();
    });

    it('restores the source blocks on unmount', async () => {
        const block = addMermaidBlock('graph TD; A-->B');
        const { unmount } = render(<MermaidRenderer />);
        await screen.findByTestId('rendered-diagram');

        unmount();

        expect(block.style.display).toBe('');
        expect(screen.queryByTestId('rendered-diagram')).toBeNull();
    });
});
