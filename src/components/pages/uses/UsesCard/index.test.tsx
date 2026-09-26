import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GithubIcon from '@/components/icons/github';
import UsesCard from '@/components/pages/uses/UsesCard';
import type { UsesSectionData } from '@/components/pages/uses/types';

const section: UsesSectionData = {
    title: 'Workstation',
    Icon: GithubIcon,
    intro: 'Where the work happens.',
    blocks: [{ kind: 'text', text: 'One laptop.' }],
};

function renderCard(cardSection: UsesSectionData = section, index = 0) {
    return render(
        <ul>
            <UsesCard
                section={cardSection}
                index={index}
            />
        </ul>
    );
}

describe('UsesCard', () => {
    it('shows the title, intro, blocks, and catalog number', () => {
        renderCard(section, 2);

        expect(
            screen.getByRole('heading', { level: 2, name: 'Workstation' })
        ).toBeInTheDocument();
        expect(screen.getByText('Where the work happens.')).toBeInTheDocument();
        expect(screen.getByText('One laptop.')).toBeInTheDocument();
        expect(screen.getByText('03')).toBeInTheDocument();
    });

    it('spans two columns only when marked wide', () => {
        renderCard({ ...section, wide: true });

        expect(screen.getByRole('listitem')).toHaveClass('md:col-span-2');
    });

    it('is a spotlight surface', () => {
        renderCard();

        expect(screen.getByRole('listitem')).toHaveAttribute(
            'data-spotlight-surface',
            'true'
        );
    });
});
