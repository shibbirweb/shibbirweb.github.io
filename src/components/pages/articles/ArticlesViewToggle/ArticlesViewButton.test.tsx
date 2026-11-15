import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ArticlesViewButton from '@/components/pages/articles/ArticlesViewToggle/ArticlesViewButton';
import { articlesViewOptions } from '@/components/pages/articles/ArticlesViewToggle/contents';

const listOption = articlesViewOptions[1];

describe('ArticlesViewButton', () => {
    it('is a button named and titled by its layout', () => {
        render(
            <ArticlesViewButton
                option={listOption}
                pressed={false}
                onSelect={vi.fn()}
            />
        );

        const button = screen.getByRole('button', { name: 'List view' });
        expect(button).toHaveAttribute('type', 'button');
        expect(button).toHaveAttribute('title', 'List view');
    });

    it.each([true, false])('reports aria-pressed=%s', (pressed) => {
        render(
            <ArticlesViewButton
                option={listOption}
                pressed={pressed}
                onSelect={vi.fn()}
            />
        );

        expect(screen.getByRole('button')).toHaveAttribute(
            'aria-pressed',
            String(pressed)
        );
    });

    it('hides its icon from assistive tech', () => {
        render(
            <ArticlesViewButton
                option={listOption}
                pressed={false}
                onSelect={vi.fn()}
            />
        );

        expect(screen.getByRole('button').querySelector('svg')).toHaveAttribute(
            'aria-hidden',
            'true'
        );
    });

    it('calls onSelect when clicked', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
            <ArticlesViewButton
                option={listOption}
                pressed={false}
                onSelect={onSelect}
            />
        );

        await user.click(screen.getByRole('button'));

        expect(onSelect).toHaveBeenCalledTimes(1);
    });
});
