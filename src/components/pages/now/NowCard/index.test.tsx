import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GithubIcon from '@/components/icons/github';
import NowCard from '@/components/pages/now/NowCard';
import type { NowSectionData } from '@/components/pages/now/types';

const section: NowSectionData = {
    title: 'Building',
    Icon: GithubIcon,
    intro: 'What is on the bench.',
    outro: 'More soon.',
    blocks: [
        { kind: 'text', text: 'A static portfolio.' },
        { kind: 'list', items: ['Tests'] },
    ],
};

function renderCard(cardSection: NowSectionData = section, index = 0) {
    return render(
        <ul>
            <NowCard
                section={cardSection}
                index={index}
            />
        </ul>
    );
}

function getCard() {
    return screen
        .getByRole('heading', { name: section.title })
        .closest('li') as HTMLLIElement;
}

describe('NowCard', () => {
    it('shows the title, intro, blocks, and outro', () => {
        renderCard();

        expect(
            screen.getByRole('heading', { level: 2, name: 'Building' })
        ).toBeInTheDocument();
        expect(screen.getByText('What is on the bench.')).toBeInTheDocument();
        expect(screen.getByText('A static portfolio.')).toBeInTheDocument();
        expect(screen.getByText('Tests')).toBeInTheDocument();
        expect(screen.getByText('More soon.')).toBeInTheDocument();
    });

    it('omits the intro and outro when absent', () => {
        renderCard({ ...section, intro: undefined, outro: undefined });

        expect(
            screen.queryByText('What is on the bench.')
        ).not.toBeInTheDocument();
        expect(screen.queryByText('More soon.')).not.toBeInTheDocument();
    });

    it('shows a two-digit catalog number from its position', () => {
        renderCard(section, 0);
        expect(screen.getByText('01')).toHaveAttribute('aria-hidden', 'true');
    });

    it('keeps larger catalog numbers intact', () => {
        renderCard(section, 11);
        expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('spans two columns only when marked wide', () => {
        const { unmount } = renderCard({ ...section, wide: true });
        expect(getCard()).toHaveClass('md:col-span-2');
        unmount();

        renderCard(section);
        expect(getCard()).not.toHaveClass('md:col-span-2');
    });

    it('is a spotlight surface with its own accent', () => {
        renderCard();

        const card = getCard();
        expect(card).toHaveAttribute('data-spotlight-surface', 'true');
        expect(card.style.getPropertyValue('--card-accent')).toBe(
            'oklch(0.72 0.16 0)'
        );
    });
});
