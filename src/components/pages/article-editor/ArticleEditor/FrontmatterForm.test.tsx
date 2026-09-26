import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import FrontmatterForm from '@/components/pages/article-editor/ArticleEditor/FrontmatterForm';
import type {
    ArticleFrontmatter,
    EditorSuggestions,
} from '@/components/pages/article-editor/ArticleEditor/types';

const suggestions: EditorSuggestions = {
    tags: ['AI', 'Docker'],
    categories: ['Infrastructure'],
    seriesNames: ['Home lab from scratch'],
    tech: ['Proxmox'],
};

function buildFrontmatter(
    overrides: Partial<ArticleFrontmatter> = {}
): ArticleFrontmatter {
    return {
        title: 'Draft title',
        description: '',
        date: '2026-05-01',
        tags: [],
        tech: [],
        learn: [],
        draft: false,
        ...overrides,
    };
}

/** Applies each patch like ArticleEditor does, and records it. */
function ControlledForm({
    initial = buildFrontmatter(),
    onChange = () => {},
}: {
    initial?: ArticleFrontmatter;
    onChange?: (patch: Partial<ArticleFrontmatter>) => void;
}) {
    const [frontmatter, setFrontmatter] = useState(initial);
    return (
        <FrontmatterForm
            frontmatter={frontmatter}
            suggestions={suggestions}
            onChange={(patch) => {
                setFrontmatter((current) => ({ ...current, ...patch }));
                onChange(patch);
            }}
        />
    );
}

describe('FrontmatterForm', () => {
    it('marks Title and Publish date as required', () => {
        render(<ControlledForm />);

        expect(screen.getByLabelText(/^Title/)).toBeRequired();
        expect(screen.getByLabelText(/^Publish date/)).toBeRequired();
        expect(screen.getByLabelText('Description')).not.toBeRequired();
    });

    it('reports title edits as a patch', () => {
        const onChange = vi.fn();
        render(<ControlledForm onChange={onChange} />);

        fireEvent.change(screen.getByLabelText(/^Title/), {
            target: { value: 'A new title' },
        });

        expect(onChange).toHaveBeenLastCalledWith({ title: 'A new title' });
    });

    it('clears optional fields to undefined rather than an empty string', () => {
        const onChange = vi.fn();
        render(
            <ControlledForm
                initial={buildFrontmatter({
                    updated: '2026-05-02',
                    category: 'Infrastructure',
                    cover: '/cover.svg',
                })}
                onChange={onChange}
            />
        );

        fireEvent.change(screen.getByLabelText('Updated date'), {
            target: { value: '' },
        });
        fireEvent.change(screen.getByLabelText('Category'), {
            target: { value: '' },
        });
        fireEvent.change(screen.getByLabelText('Cover path'), {
            target: { value: '' },
        });

        expect(onChange).toHaveBeenCalledWith({ updated: undefined });
        expect(onChange).toHaveBeenCalledWith({ category: undefined });
        expect(onChange).toHaveBeenCalledWith({ cover: undefined });
    });

    it('offers Not set plus every difficulty level', () => {
        render(<ControlledForm />);

        const select = screen.getByLabelText('Difficulty');
        const options = Array.from(select.querySelectorAll('option')).map(
            (option) => option.textContent
        );
        expect(options).toEqual([
            'Not set',
            'Beginner',
            'Intermediate',
            'Advanced',
        ]);
        expect(select).toHaveValue('');
    });

    it('sets and unsets the difficulty', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<ControlledForm onChange={onChange} />);
        const select = screen.getByLabelText('Difficulty');

        await user.selectOptions(select, 'Advanced');
        expect(onChange).toHaveBeenLastCalledWith({ difficulty: 'Advanced' });

        await user.selectOptions(select, 'Not set');
        expect(onChange).toHaveBeenLastCalledWith({ difficulty: undefined });
    });

    it('hides the series fields until "Part of a series" is ticked', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<ControlledForm onChange={onChange} />);
        expect(screen.queryByLabelText('Series name')).not.toBeInTheDocument();

        await user.click(screen.getByLabelText(/Part of a series/));

        expect(onChange).toHaveBeenLastCalledWith({
            series: { name: '', order: 1 },
        });
        expect(screen.getByLabelText('Series name')).toHaveValue('');
        expect(screen.getByLabelText('Part')).toHaveValue(1);
    });

    it('suggests existing series names', async () => {
        const user = userEvent.setup();
        const { container } = render(<ControlledForm />);

        await user.click(screen.getByLabelText(/Part of a series/));

        const listId = screen
            .getByLabelText('Series name')
            .getAttribute('list');
        const option = container.querySelector(
            `datalist[id="${listId}"] option`
        );
        expect(option).toHaveAttribute('value', 'Home lab from scratch');
    });

    it('edits the series name and part, falling back to part 1', () => {
        const onChange = vi.fn();
        render(
            <ControlledForm
                initial={buildFrontmatter({
                    series: { name: 'Home lab', order: 2 },
                })}
                onChange={onChange}
            />
        );

        fireEvent.change(screen.getByLabelText('Series name'), {
            target: { value: 'Home lab v2' },
        });
        expect(onChange).toHaveBeenLastCalledWith({
            series: { name: 'Home lab v2', order: 2 },
        });

        fireEvent.change(screen.getByLabelText('Part'), {
            target: { value: '' },
        });
        expect(onChange).toHaveBeenLastCalledWith({
            series: { name: 'Home lab v2', order: 1 },
        });
    });

    it('drops the series when the checkbox is unticked', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <ControlledForm
                initial={buildFrontmatter({
                    series: { name: 'Home lab', order: 2 },
                })}
                onChange={onChange}
            />
        );

        await user.click(screen.getByLabelText(/Part of a series/));

        expect(onChange).toHaveBeenLastCalledWith({ series: undefined });
        expect(screen.queryByLabelText('Series name')).not.toBeInTheDocument();
    });

    it('routes tags, tech, and takeaways through their own list inputs', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<ControlledForm onChange={onChange} />);

        await user.type(screen.getByLabelText('Tags'), 'Docker{Enter}');
        await user.type(screen.getByLabelText('Tech'), 'Proxmox{Enter}');
        await user.type(
            screen.getByLabelText('What readers will learn'),
            'Back up VMs{Enter}'
        );

        expect(onChange).toHaveBeenCalledWith({ tags: ['Docker'] });
        expect(onChange).toHaveBeenCalledWith({ tech: ['Proxmox'] });
        expect(onChange).toHaveBeenCalledWith({ learn: ['Back up VMs'] });
    });

    it('toggles the draft flag', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<ControlledForm onChange={onChange} />);

        await user.click(screen.getByLabelText(/^Draft/));

        expect(onChange).toHaveBeenLastCalledWith({ draft: true });
    });
});
