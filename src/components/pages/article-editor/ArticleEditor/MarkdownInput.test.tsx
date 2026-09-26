import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import MarkdownInput from '@/components/pages/article-editor/ArticleEditor/MarkdownInput';

function ControlledInput({ initialValue }: { initialValue: string }) {
    const [value, setValue] = useState(initialValue);
    return (
        <MarkdownInput
            value={value}
            onChange={setValue}
        />
    );
}

describe('MarkdownInput', () => {
    it('reports edits through onChange', () => {
        const onChange = vi.fn();
        render(
            <MarkdownInput
                value=""
                onChange={onChange}
            />
        );

        fireEvent.change(screen.getByLabelText('Article Markdown'), {
            target: { value: '## Heading' },
        });

        expect(onChange).toHaveBeenCalledWith('## Heading');
    });

    it('shows the character count', () => {
        render(
            <MarkdownInput
                value="Hello"
                onChange={() => {}}
            />
        );

        expect(screen.getByText('5 characters')).toBeInTheDocument();
    });

    it('indents with four spaces on Tab instead of leaving the field', () => {
        render(<ControlledInput initialValue="ab" />);
        const textarea = screen.getByLabelText(
            'Article Markdown'
        ) as HTMLTextAreaElement;
        textarea.setSelectionRange(1, 1);

        const notCancelled = fireEvent.keyDown(textarea, { key: 'Tab' });

        expect(notCancelled).toBe(false);
        expect(textarea).toHaveValue('a    b');
    });

    it('leaves other keys to the browser', () => {
        const onChange = vi.fn();
        render(
            <MarkdownInput
                value="ab"
                onChange={onChange}
            />
        );

        const notCancelled = fireEvent.keyDown(
            screen.getByLabelText('Article Markdown'),
            { key: 'Enter' }
        );

        expect(notCancelled).toBe(true);
        expect(onChange).not.toHaveBeenCalled();
    });
});
