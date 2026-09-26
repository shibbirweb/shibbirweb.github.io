import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TagGroup from '@/components/pages/common/TagGroup';

describe('TagGroup', () => {
    it('renders a heading and one tag per entry', () => {
        render(
            <TagGroup
                label="Editors"
                tags={['VS Code', 'Vim']}
            />
        );

        expect(
            screen.getByRole('heading', { level: 3, name: 'Editors' })
        ).toBeInTheDocument();
        expect(
            screen.getAllByRole('listitem').map((tag) => tag.textContent)
        ).toEqual(['VS Code', 'Vim']);
    });

    it('omits the heading when there is no label', () => {
        render(<TagGroup tags={['Docker']} />);

        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
        expect(screen.getByRole('listitem')).toHaveTextContent('Docker');
    });
});
