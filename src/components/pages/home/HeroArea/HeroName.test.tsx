import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HeroName from '@/components/pages/home/HeroArea/HeroName';

describe('HeroName', () => {
    it('renders each word as its own direct child of the heading, in order', () => {
        render(
            <h1>
                <HeroName words={['Shibbir', 'Ahmed']} />
            </h1>
        );

        const heading = screen.getByRole('heading', { level: 1 });
        const words = Array.from(heading.children).map(
            (child) => child.textContent
        );
        expect(words).toEqual(['Shibbir', 'Ahmed']);
        expect(heading.children[0].tagName).toBe('SPAN');
    });

    it('renders nothing for an empty list', () => {
        const { container } = render(<HeroName words={[]} />);

        expect(container).toBeEmptyDOMElement();
    });
});
