import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DifficultyBadge from '@/components/pages/articles/DifficultyBadge';
import type { ArticleDifficulty } from '@/lib/posts';

function barStates(container: HTMLElement): boolean[] {
    const bars = container.querySelectorAll('[aria-hidden] > span');
    return Array.from(bars).map((bar) => bar.classList.contains('opacity-100'));
}

describe('DifficultyBadge', () => {
    it.each<[ArticleDifficulty, boolean[]]>([
        ['Beginner', [true, false, false]],
        ['Intermediate', [true, true, false]],
        ['Advanced', [true, true, true]],
    ])('labels %s and fills the matching number of bars', (level, filled) => {
        const { container } = render(<DifficultyBadge level={level} />);

        expect(screen.getByText(level)).toBeInTheDocument();
        expect(barStates(container)).toEqual(filled);
    });

    it('hides the signal bars from assistive tech', () => {
        const { container } = render(<DifficultyBadge level="Beginner" />);

        const bars = container.querySelector('[aria-hidden]');
        expect(bars).not.toBeNull();
        expect(bars).not.toHaveTextContent('Beginner');
    });

    it('tints each level with its own colour', () => {
        const { container: beginner } = render(
            <DifficultyBadge level="Beginner" />
        );
        const { container: advanced } = render(
            <DifficultyBadge level="Advanced" />
        );

        expect(beginner.firstElementChild).toHaveClass('text-emerald-700');
        expect(advanced.firstElementChild).toHaveClass('text-rose-700');
    });

    it('merges extra classes', () => {
        const { container } = render(
            <DifficultyBadge
                level="Intermediate"
                className="ml-2"
            />
        );

        expect(container.firstElementChild).toHaveClass('rounded-full', 'ml-2');
    });
});
