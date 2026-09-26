import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Tag from '@/components/pages/common/Tag';

describe('Tag', () => {
    it('renders its children as a list item', () => {
        render(
            <ul>
                <Tag>TypeScript</Tag>
            </ul>
        );

        expect(screen.getByRole('listitem')).toHaveTextContent('TypeScript');
    });

    it('merges the caller class and forwards attributes', () => {
        render(
            <ul>
                <Tag
                    className="px-3"
                    title="Language"
                >
                    Go
                </Tag>
            </ul>
        );

        const tag = screen.getByRole('listitem');
        expect(tag).toHaveClass('rounded-full', 'px-3');
        expect(tag).toHaveAttribute('title', 'Language');
    });
});
