import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GithubIcon from '@/components/icons/github';
import NowGrid from '@/components/pages/now/NowGrid';
import type { NowSectionData } from '@/components/pages/now/types';

const sections: NowSectionData[] = [
    {
        title: 'Building',
        Icon: GithubIcon,
        blocks: [{ kind: 'text', text: 'A portfolio.' }],
    },
    {
        title: 'Reading',
        Icon: GithubIcon,
        blocks: [{ kind: 'text', text: 'A novel.' }],
    },
];

describe('NowGrid', () => {
    it('renders one card per section, in order', () => {
        render(<NowGrid sections={sections} />);

        const titles = screen
            .getAllByRole('heading', { level: 2 })
            .map((heading) => heading.textContent);
        expect(titles).toEqual(['Building', 'Reading']);
    });

    it('numbers the cards by position', () => {
        render(<NowGrid sections={sections} />);

        expect(screen.getByText('01')).toBeInTheDocument();
        expect(screen.getByText('02')).toBeInTheDocument();
    });

    it('renders the cards inside a single list', () => {
        const { container } = render(<NowGrid sections={sections} />);

        const grid = container.firstElementChild as HTMLElement;
        expect(grid.tagName).toBe('UL');
        expect(grid.children).toHaveLength(2);
    });
});
