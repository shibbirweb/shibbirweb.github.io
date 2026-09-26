import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import MobileTableOfContents from '@/components/pages/articles/TableOfContents/MobileTableOfContents';
import type { TocItem } from '@/lib/posts';

const toc: TocItem[] = [
    { id: 'intro', text: 'Intro', level: 2 },
    { id: 'setup-steps', text: 'Setup steps', level: 3 },
];

describe('MobileTableOfContents', () => {
    it('renders nothing when the article has no headings', () => {
        const { container } = render(
            <MobileTableOfContents
                toc={[]}
                accentColors={['#000000', '#ffffff']}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('is a collapsed "On this page" disclosure', () => {
        const { container } = render(
            <MobileTableOfContents
                toc={toc}
                accentColors={['#000000', '#ffffff']}
            />
        );

        const details = container.querySelector('details');
        expect(details).not.toHaveAttribute('open');
        expect(screen.getByText('On this page')).toBeInTheDocument();
    });

    it('opens from its summary and closes after a heading link is picked', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <MobileTableOfContents
                toc={toc}
                accentColors={['#000000', '#ffffff']}
            />
        );
        const details = container.querySelector(
            'details'
        ) as HTMLDetailsElement;

        await user.click(screen.getByText('On this page'));
        expect(details).toHaveAttribute('open');

        await user.click(screen.getByRole('link', { name: 'Setup steps' }));
        expect(details).not.toHaveAttribute('open');
    });
});
