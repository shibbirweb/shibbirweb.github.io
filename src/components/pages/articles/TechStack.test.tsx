import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TechStack from '@/components/pages/articles/TechStack';

describe('TechStack', () => {
    it('renders nothing for an empty stack', () => {
        const { container } = render(<TechStack tech={[]} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('labels the strip and lists each technology in order', () => {
        render(<TechStack tech={['Next.js', 'TypeScript', 'Shiki']} />);

        expect(screen.getByText('Stack')).toBeInTheDocument();
        const items = screen.getAllByRole('listitem');
        expect(items.map((item) => item.textContent)).toEqual([
            'Next.js',
            'TypeScript',
            'Shiki',
        ]);
    });

    it('is non-interactive (no links, unlike tags)', () => {
        render(<TechStack tech={['Docker']} />);

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('merges extra classes onto the wrapper', () => {
        const { container } = render(
            <TechStack
                tech={['Docker']}
                className="mt-5"
            />
        );

        expect(container.firstElementChild).toHaveClass('flex', 'mt-5');
    });
});
