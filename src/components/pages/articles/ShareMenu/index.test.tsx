import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ShareMenu from '@/components/pages/articles/ShareMenu';

vi.mock('next/navigation', () => ({
    usePathname: () => '/articles/static-deploys',
}));

const TITLE = 'Static deploys & you';

function pageUrl(): string {
    return `${window.location.origin}${window.location.pathname}`;
}

function renderMenu() {
    const user = userEvent.setup();
    render(
        <ShareMenu
            title={TITLE}
            description="Shipping without a server."
        />
    );
    const trigger = screen.getByRole('button', { name: 'Share this article' });
    return { user, trigger };
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('ShareMenu', () => {
    it('starts closed and opens from the trigger', async () => {
        const { user, trigger } = renderMenu();
        expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
        expect(trigger).toHaveAttribute('aria-expanded', 'false');

        await user.click(trigger);

        expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('toggles closed on a second trigger press', async () => {
        const { user, trigger } = renderMenu();

        await user.click(trigger);
        await user.click(trigger);

        expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('builds share intents for X, LinkedIn, Facebook, and WhatsApp', () => {
        renderMenu();
        const url = encodeURIComponent(pageUrl());
        const title = encodeURIComponent(TITLE);

        expect(screen.getByRole('menuitem', { name: 'X' })).toHaveAttribute(
            'href',
            `https://twitter.com/intent/tweet?url=${url}&text=${title}&via=shibbirweb`
        );
        expect(
            screen.getByRole('menuitem', { name: 'LinkedIn' })
        ).toHaveAttribute(
            'href',
            `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        );
        expect(
            screen.getByRole('menuitem', { name: 'Facebook' })
        ).toHaveAttribute(
            'href',
            `https://www.facebook.com/sharer/sharer.php?u=${url}`
        );
        expect(
            screen.getByRole('menuitem', { name: 'WhatsApp' })
        ).toHaveAttribute(
            'href',
            `https://wa.me/?text=${encodeURIComponent(`${TITLE} ${pageUrl()}`)}`
        );
    });

    it('opens share intents in a new tab without an opener', () => {
        renderMenu();

        const link = screen.getByRole('menuitem', { name: 'LinkedIn' });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('closes after a share destination is picked', async () => {
        const { user, trigger } = renderMenu();
        await user.click(trigger);

        fireEvent.click(screen.getByRole('menuitem', { name: 'Facebook' }));

        expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('hides "Share via" when the Web Share API is missing', () => {
        renderMenu();

        expect(
            screen.queryByRole('menuitem', { name: 'Share via...' })
        ).not.toBeInTheDocument();
    });

    it('offers "Share via" when the Web Share API exists and hands it the article', async () => {
        const share = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal('navigator', { ...navigator, share });
        const { user, trigger } = renderMenu();
        await user.click(trigger);

        await user.click(
            screen.getByRole('menuitem', { name: 'Share via...' })
        );

        expect(share).toHaveBeenCalledWith({
            title: TITLE,
            text: 'Shipping without a server.',
            url: pageUrl(),
        });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('copies the page link and confirms it', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
        // Rendered without userEvent, whose setup swaps in its own clipboard.
        render(<ShareMenu title={TITLE} />);

        await act(async () => {
            fireEvent.click(
                screen.getByRole('menuitem', { name: 'Copy link' })
            );
            await Promise.resolve();
        });

        expect(writeText).toHaveBeenCalledWith(pageUrl());
        expect(
            screen.getByRole('menuitem', { name: 'Link copied' })
        ).toBeInTheDocument();
    });

    it('closes on Escape', async () => {
        const { user, trigger } = renderMenu();
        await user.click(trigger);

        await user.keyboard('{Escape}');

        expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes on a press outside the menu', async () => {
        const { user, trigger } = renderMenu();
        await user.click(trigger);

        fireEvent.pointerDown(document.body);

        expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens downward when there is room below the trigger', async () => {
        const { user, trigger } = renderMenu();

        await user.click(trigger);

        const panelWrapper = screen.getByRole('menu').parentElement;
        expect(panelWrapper).toHaveClass('top-full');
        expect(panelWrapper).not.toHaveClass('bottom-full');
    });

    it('flips upward when the trigger sits near the bottom of the viewport', async () => {
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
        const { user, trigger } = renderMenu();
        const menuRoot = trigger.parentElement as HTMLElement;
        vi.spyOn(menuRoot, 'getBoundingClientRect').mockReturnValue({
            top: 720,
            bottom: 764,
        } as DOMRect);
        vi.spyOn(
            screen.getByRole('menu'),
            'offsetHeight',
            'get'
        ).mockReturnValue(320);

        await user.click(trigger);

        const panelWrapper = screen.getByRole('menu').parentElement;
        expect(panelWrapper).toHaveClass('bottom-full');
    });

    it('shows the custom trigger label', () => {
        render(
            <ShareMenu
                title={TITLE}
                label="Send"
            />
        );

        expect(
            screen.getByRole('button', { name: 'Share this article' })
        ).toHaveTextContent('Send');
    });
});
