import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import SaveBar from '@/components/pages/article-editor/ArticleEditor/SaveBar';

type SaveBarProps = ComponentProps<typeof SaveBar>;

function renderSaveBar(overrides: Partial<SaveBarProps> = {}) {
    const props: SaveBarProps = {
        existing: [
            {
                file: '01-first-post.md',
                slug: 'first-post',
                title: 'First post',
                status: 'published',
            },
            {
                file: '02-work-in-progress.md',
                slug: 'work-in-progress',
                title: 'Work in progress',
                status: 'draft',
            },
        ],
        slug: 'first-post',
        isSlugAuto: true,
        isPreviewVisible: true,
        isDirty: false,
        saveState: { status: 'idle' },
        onSlugChange: vi.fn(),
        onResetSlug: vi.fn(),
        onNew: vi.fn(),
        onOpen: vi.fn(),
        onSave: vi.fn(),
        onPreview: vi.fn(),
        onDelete: vi.fn(),
        canDelete: false,
        onTogglePreview: vi.fn(),
        onOpenGuide: vi.fn(),
        ...overrides,
    };
    render(<SaveBar {...props} />);
    return { props, user: userEvent.setup() };
}

describe('SaveBar', () => {
    it('keeps Delete disabled until a saved file backs the slug', () => {
        renderSaveBar({ canDelete: false });

        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        expect(deleteButton).toBeDisabled();
        expect(deleteButton).toHaveAttribute(
            'title',
            'Save the article before it can be deleted'
        );
    });

    it('enables Delete for a saved file and calls onDelete', async () => {
        const { props, user } = renderSaveBar({ canDelete: true });

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(props.onDelete).toHaveBeenCalledTimes(1);
    });

    it('shows the Unsaved marker only while dirty', () => {
        renderSaveBar({ isDirty: true });

        expect(screen.getByText('Unsaved')).toBeInTheDocument();
    });

    it('hides the Unsaved marker when clean', () => {
        renderSaveBar({ isDirty: false });

        expect(screen.queryByText('Unsaved')).not.toBeInTheDocument();
    });

    it('disables Save, Full preview, and Delete while saving', () => {
        renderSaveBar({ saveState: { status: 'saving' }, canDelete: true });

        expect(
            screen.getByRole('button', { name: 'Saving...' })
        ).toBeDisabled();
        expect(
            screen.getByRole('button', { name: 'Full preview' })
        ).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    });

    it('announces the saved and error messages', () => {
        renderSaveBar({
            saveState: {
                status: 'saved',
                message: 'Saved 01-first-post.md (published)',
            },
        });

        expect(screen.getByRole('status')).toHaveTextContent(
            'Saved 01-first-post.md (published)'
        );
    });

    it('styles an error message as an error', () => {
        renderSaveBar({
            saveState: { status: 'error', message: 'Title is required' },
        });

        expect(screen.getByRole('status')).toHaveTextContent(
            'Title is required'
        );
        expect(screen.getByRole('status')).toHaveClass('text-red-600');
    });

    it('shows no status while idle', () => {
        renderSaveBar();

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('edits the slug through onSlugChange', async () => {
        const { props, user } = renderSaveBar({ slug: '' });

        await user.type(screen.getByLabelText('File name slug'), 'x');

        expect(props.onSlugChange).toHaveBeenCalledWith('x');
    });

    it('offers Reset to title only for an overridden slug', async () => {
        const { props, user } = renderSaveBar({ isSlugAuto: false });

        await user.click(
            screen.getByRole('button', { name: 'Reset to title' })
        );

        expect(props.onResetSlug).toHaveBeenCalledTimes(1);
    });

    it('hides Reset to title while the slug follows the title', () => {
        renderSaveBar({ isSlugAuto: true });

        expect(
            screen.queryByRole('button', { name: 'Reset to title' })
        ).not.toBeInTheDocument();
    });

    it('lists existing articles, prefixing drafts, and opens the chosen file', async () => {
        const { props, user } = renderSaveBar();
        const select = screen.getByLabelText('Open article');

        expect(
            screen.getByRole('option', { name: '[Draft] Work in progress' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('option', { name: 'First post' })
        ).toBeInTheDocument();

        await user.selectOptions(select, '02-work-in-progress.md');

        expect(props.onOpen).toHaveBeenCalledWith('02-work-in-progress.md');
        expect(select).toHaveValue('');
    });

    it('labels the preview toggle by state and reports it as pressed', async () => {
        const { props, user } = renderSaveBar({ isPreviewVisible: true });

        const toggle = screen.getByRole('button', { name: 'Hide preview' });
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
        await user.click(toggle);

        expect(props.onTogglePreview).toHaveBeenCalledTimes(1);
    });

    it('wires New article, Guide, Save, and Full preview to their callbacks', async () => {
        const { props, user } = renderSaveBar();

        await user.click(screen.getByRole('button', { name: 'New article' }));
        await user.click(screen.getByRole('button', { name: 'Guide' }));
        await user.click(screen.getByRole('button', { name: 'Save' }));
        await user.click(screen.getByRole('button', { name: 'Full preview' }));

        expect(props.onNew).toHaveBeenCalledTimes(1);
        expect(props.onOpenGuide).toHaveBeenCalledTimes(1);
        expect(props.onSave).toHaveBeenCalledTimes(1);
        expect(props.onPreview).toHaveBeenCalledTimes(1);
    });
});
