import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import UsesBlock from '@/components/pages/uses/UsesBlock';

describe('UsesBlock', () => {
    it('renders a specs block as a labelled definition list', () => {
        const { container } = render(
            <UsesBlock
                block={{
                    kind: 'specs',
                    label: 'Desk',
                    specs: [
                        { label: 'CPU', value: 'M3 Pro' },
                        { label: 'RAM', value: '36 GB' },
                    ],
                }}
            />
        );

        expect(
            screen.getByRole('heading', { level: 3, name: 'Desk' })
        ).toBeInTheDocument();
        const terms = Array.from(container.querySelectorAll('dt')).map(
            (term) => term.textContent
        );
        const values = Array.from(container.querySelectorAll('dd')).map(
            (value) => value.textContent
        );
        expect(terms).toEqual(['CPU', 'RAM']);
        expect(values).toEqual(['M3 Pro', '36 GB']);
    });

    it('omits the spec heading when there is no label', () => {
        render(
            <UsesBlock
                block={{
                    kind: 'specs',
                    specs: [{ label: 'CPU', value: 'M3 Pro' }],
                }}
            />
        );

        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('renders a tags block as a tag list', () => {
        render(
            <UsesBlock
                block={{ kind: 'tags', label: 'Editors', tags: ['VS Code'] }}
            />
        );

        expect(
            screen.getByRole('heading', { name: 'Editors' })
        ).toBeInTheDocument();
        expect(
            within(screen.getByRole('list')).getByRole('listitem')
        ).toHaveTextContent('VS Code');
    });

    it('renders a gear block with each item name and note', () => {
        render(
            <UsesBlock
                block={{
                    kind: 'gear',
                    gear: [
                        { name: 'Keyboard', description: 'Quiet switches.' },
                        { name: 'Mouse', description: 'Light and wired.' },
                    ],
                }}
            />
        );

        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(2);
        expect(
            within(items[0]).getByRole('heading', { name: 'Keyboard' })
        ).toBeInTheDocument();
        expect(
            within(items[0]).getByText('Quiet switches.')
        ).toBeInTheDocument();
    });

    it('renders a text block as a paragraph', () => {
        render(<UsesBlock block={{ kind: 'text', text: 'Nothing fancy.' }} />);

        expect(screen.getByText('Nothing fancy.').tagName).toBe('P');
    });
});
