import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import TagListInput from '@/components/pages/article-editor/ArticleEditor/TagListInput';

/** Holds the values in state, like FrontmatterForm does, and reports changes. */
function ControlledTagList({
    initialValues = [],
    onChange = () => {},
    suggestions,
}: {
    initialValues?: string[];
    onChange?: (values: string[]) => void;
    suggestions?: string[];
}) {
    const [values, setValues] = useState(initialValues);
    return (
        <TagListInput
            label="Tags"
            values={values}
            placeholder="Type a tag and press Enter"
            suggestions={suggestions}
            onChange={(next) => {
                setValues(next);
                onChange(next);
            }}
        />
    );
}

function chips(): string[] {
    return screen
        .queryAllByRole('button', { name: /^Remove / })
        .map((chip) => (chip.getAttribute('aria-label') ?? '').slice(7));
}

describe('TagListInput', () => {
    it('labels the input and shows the placeholder while empty', () => {
        render(<ControlledTagList />);

        expect(screen.getByLabelText('Tags')).toHaveAttribute(
            'placeholder',
            'Type a tag and press Enter'
        );
    });

    it('adds a trimmed value on Enter and clears the input', async () => {
        const user = userEvent.setup();
        render(<ControlledTagList />);
        const input = screen.getByLabelText('Tags');

        await user.type(input, '  Docker  {Enter}');

        expect(chips()).toEqual(['Docker']);
        expect(input).toHaveValue('');
        expect(input).toHaveAttribute('placeholder', 'Add another');
    });

    it('adds a value on comma without keeping the comma', async () => {
        const user = userEvent.setup();
        render(<ControlledTagList />);

        await user.type(screen.getByLabelText('Tags'), 'AI,Self Hosting,');

        expect(chips()).toEqual(['AI', 'Self Hosting']);
    });

    it('adds the pending value on blur', async () => {
        const user = userEvent.setup();
        render(<ControlledTagList />);

        await user.type(screen.getByLabelText('Tags'), 'Next.js');
        await user.tab();

        expect(chips()).toEqual(['Next.js']);
    });

    it('drops case-insensitive duplicates', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <ControlledTagList
                initialValues={['Docker']}
                onChange={onChange}
            />
        );
        const input = screen.getByLabelText('Tags');

        await user.type(input, 'docker{Enter}');

        expect(chips()).toEqual(['Docker']);
        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveValue('');
    });

    it('ignores blank entries', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<ControlledTagList onChange={onChange} />);

        await user.type(screen.getByLabelText('Tags'), '   {Enter}');

        expect(onChange).not.toHaveBeenCalled();
    });

    it('removes the last value on Backspace in an empty input', async () => {
        const user = userEvent.setup();
        render(<ControlledTagList initialValues={['AI', 'Docker']} />);

        await user.click(screen.getByLabelText('Tags'));
        await user.keyboard('{Backspace}');

        expect(chips()).toEqual(['AI']);
    });

    it('keeps values while Backspace is editing typed text', async () => {
        const user = userEvent.setup();
        render(<ControlledTagList initialValues={['AI']} />);
        const input = screen.getByLabelText('Tags');

        await user.type(input, 'Do{Backspace}');

        expect(chips()).toEqual(['AI']);
        expect(input).toHaveValue('D');
    });

    it('removes a specific value from its chip', async () => {
        const user = userEvent.setup();
        render(<ControlledTagList initialValues={['AI', 'Docker', 'VPN']} />);

        await user.click(screen.getByRole('button', { name: 'Remove Docker' }));

        expect(chips()).toEqual(['AI', 'VPN']);
    });

    it('offers suggestions through a linked datalist', () => {
        const { container } = render(
            <ControlledTagList suggestions={['AI', 'Docker']} />
        );

        const input = screen.getByLabelText('Tags');
        const listId = input.getAttribute('list');
        expect(listId).toBeTruthy();
        const datalist = container.querySelector(`datalist[id="${listId}"]`);
        const options = Array.from(datalist?.querySelectorAll('option') ?? []);
        expect(options.map((option) => option.value)).toEqual(['AI', 'Docker']);
    });

    it('omits the datalist without suggestions', () => {
        const { container } = render(<ControlledTagList />);

        expect(screen.getByLabelText('Tags')).not.toHaveAttribute('list');
        expect(container.querySelector('datalist')).toBeNull();
    });
});
