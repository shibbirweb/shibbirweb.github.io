import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NowBlock from '@/components/pages/now/NowBlock';

describe('NowBlock', () => {
    it('renders a tags block as a labelled tag list', () => {
        render(
            <NowBlock
                block={{
                    kind: 'tags',
                    label: 'Learning',
                    tags: ['Rust', 'Go'],
                }}
            />
        );

        expect(
            screen.getByRole('heading', { level: 3, name: 'Learning' })
        ).toBeInTheDocument();
        const tags = within(screen.getByRole('list'))
            .getAllByRole('listitem')
            .map((tag) => tag.textContent);
        expect(tags).toEqual(['Rust', 'Go']);
    });

    it('renders a list block as bullet rows', () => {
        render(
            <NowBlock
                block={{ kind: 'list', items: ['Ship v2', 'Read more'] }}
            />
        );

        const rows = screen.getAllByRole('listitem');
        expect(rows.map((row) => row.textContent)).toEqual([
            'Ship v2',
            'Read more',
        ]);
        expect(rows[0].querySelector('[aria-hidden="true"]')).not.toBeNull();
    });

    it('renders a text block as a paragraph', () => {
        render(
            <NowBlock block={{ kind: 'text', text: 'Mostly heads down.' }} />
        );

        expect(screen.getByText('Mostly heads down.').tagName).toBe('P');
    });
});
