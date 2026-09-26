import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ArticleEditor from '@/components/pages/article-editor/ArticleEditor';
import type {
    ArticleDraft,
    ArticleListItem,
    EditorActions,
    EditorSuggestions,
} from '@/components/pages/article-editor/ArticleEditor/types';

// The live preview runs the full Shiki pipeline; the editor wiring is what is
// under test here, so the preview is a stand-in.
vi.mock(
    '@/components/pages/article-editor/ArticleEditor/EditorPreview',
    () => ({
        default: ({ body }: { body: string }) => (
            <div data-testid="preview">{body}</div>
        ),
    })
);

const suggestions: EditorSuggestions = {
    tags: [],
    categories: [],
    seriesNames: [],
    tech: [],
};

const existing: ArticleListItem[] = [
    {
        file: '03-pi-hole-setup.md',
        slug: 'pi-hole-setup',
        title: 'Pi-hole setup',
        status: 'published',
    },
];

const loadedDraft: ArticleDraft = {
    frontmatter: {
        title: 'Pi-hole setup',
        description: 'Blocking ads for the whole network.',
        date: '2026-02-01',
        tags: ['DNS'],
        tech: [],
        learn: [],
        draft: false,
    },
    body: 'Loaded body',
};

function fakeActions(overrides: Partial<EditorActions> = {}): EditorActions {
    return {
        listArticles: vi.fn().mockResolvedValue(existing),
        loadArticle: vi.fn().mockResolvedValue(loadedDraft),
        saveArticle: vi.fn(async (draft: ArticleDraft, slug: string) => ({
            file: `04-${slug}.md`,
            status: draft.frontmatter.draft ? 'draft' : 'published',
        })) as EditorActions['saveArticle'],
        deleteArticle: vi.fn().mockResolvedValue({
            removed: ['03-pi-hole-setup.md'],
        }),
        getSuggestions: vi.fn().mockResolvedValue(suggestions),
        ...overrides,
    };
}

function renderEditor(actions = fakeActions()) {
    const user = userEvent.setup();
    render(
        <ArticleEditor
            actions={actions}
            existing={existing}
            suggestions={suggestions}
        />
    );
    return { actions, user };
}

function slugInput(): HTMLInputElement {
    return screen.getByLabelText('File name slug') as HTMLInputElement;
}

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('ArticleEditor', () => {
    it('starts from a clean empty draft with an untitled slug', () => {
        renderEditor();

        expect(screen.getByLabelText(/^Title/)).toHaveValue('');
        expect(screen.getByLabelText(/^Publish date/)).toHaveValue(
            '2026-06-15'
        );
        expect(slugInput()).toHaveValue('untitled-article');
        expect(screen.queryByText('Unsaved')).not.toBeInTheDocument();
    });

    it('derives the file slug from the title and flags unsaved edits', () => {
        renderEditor();

        fireEvent.change(screen.getByLabelText(/^Title/), {
            target: { value: 'Tunnels & DNS, Explained!' },
        });

        expect(slugInput()).toHaveValue('tunnels-dns-explained');
        expect(screen.getByText('Unsaved')).toBeInTheDocument();
    });

    it('lets the author override the slug and reset it back to the title', async () => {
        const { user } = renderEditor();
        fireEvent.change(screen.getByLabelText(/^Title/), {
            target: { value: 'My Title' },
        });

        fireEvent.change(slugInput(), { target: { value: 'Custom Name' } });
        expect(slugInput()).toHaveValue('custom-name');

        await user.click(
            screen.getByRole('button', { name: 'Reset to title' })
        );
        expect(slugInput()).toHaveValue('my-title');
    });

    it('saves the draft with its slug and clears the unsaved marker', async () => {
        const { actions, user } = renderEditor();
        fireEvent.change(screen.getByLabelText(/^Title/), {
            target: { value: 'New post' },
        });

        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(actions.saveArticle).toHaveBeenCalledWith(
            expect.objectContaining({
                frontmatter: expect.objectContaining({ title: 'New post' }),
            }),
            'new-post'
        );
        expect(await screen.findByRole('status')).toHaveTextContent(
            'Saved 04-new-post.md (published)'
        );
        expect(screen.queryByText('Unsaved')).not.toBeInTheDocument();
    });

    it('keeps the edits dirty when a save fails', async () => {
        const { user } = renderEditor(
            fakeActions({
                saveArticle: vi.fn().mockRejectedValue(new Error('Disk full')),
            })
        );
        fireEvent.change(screen.getByLabelText(/^Title/), {
            target: { value: 'New post' },
        });

        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByRole('status')).toHaveTextContent(
            'Disk full'
        );
        expect(screen.getByText('Unsaved')).toBeInTheDocument();
    });

    it('opens an existing article into the form', async () => {
        const { actions, user } = renderEditor();

        await user.selectOptions(
            screen.getByLabelText('Open article'),
            '03-pi-hole-setup.md'
        );

        expect(actions.loadArticle).toHaveBeenCalledWith('03-pi-hole-setup.md');
        await waitFor(() => {
            expect(screen.getByLabelText(/^Title/)).toHaveValue(
                'Pi-hole setup'
            );
        });
        expect(screen.getByLabelText('Article Markdown')).toHaveValue(
            'Loaded body'
        );
        expect(slugInput()).toHaveValue('pi-hole-setup');
        expect(screen.queryByText('Unsaved')).not.toBeInTheDocument();
    });

    it('asks before discarding unsaved edits, and stays put when declined', async () => {
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
        const { actions, user } = renderEditor();
        fireEvent.change(screen.getByLabelText(/^Title/), {
            target: { value: 'Half written' },
        });

        await user.selectOptions(
            screen.getByLabelText('Open article'),
            '03-pi-hole-setup.md'
        );
        await user.click(screen.getByRole('button', { name: 'New article' }));

        expect(confirm).toHaveBeenCalledTimes(2);
        expect(actions.loadArticle).not.toHaveBeenCalled();
        expect(screen.getByLabelText(/^Title/)).toHaveValue('Half written');
    });

    it('enables Delete only once the slug maps to a saved file, then deletes after confirming', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const { actions, user } = renderEditor();
        expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();

        await user.selectOptions(
            screen.getByLabelText('Open article'),
            '03-pi-hole-setup.md'
        );
        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        await waitFor(() => {
            expect(deleteButton).toBeEnabled();
        });
        await user.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith(
            expect.stringContaining('Delete 03-pi-hole-setup.md?')
        );
        expect(actions.deleteArticle).toHaveBeenCalledWith('pi-hole-setup');
        await waitFor(() => {
            expect(screen.getByLabelText(/^Title/)).toHaveValue('');
        });
    });

    it('does not delete when the confirm is declined', async () => {
        const { actions, user } = renderEditor();
        await user.selectOptions(
            screen.getByLabelText('Open article'),
            '03-pi-hole-setup.md'
        );
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Delete' })
            ).toBeEnabled();
        });
        vi.spyOn(window, 'confirm').mockReturnValue(false);

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(actions.deleteArticle).not.toHaveBeenCalled();
    });

    it('saves before opening the full preview in a new tab', async () => {
        const open = vi.spyOn(window, 'open').mockReturnValue(null);
        const { actions, user } = renderEditor();
        fireEvent.change(screen.getByLabelText(/^Title/), {
            target: { value: 'Preview me' },
        });

        await user.click(screen.getByRole('button', { name: 'Full preview' }));

        await waitFor(() => {
            expect(open).toHaveBeenCalledWith(
                '/studio/article-editor/preview/preview-me',
                '_blank',
                'noopener,noreferrer'
            );
        });
        expect(actions.saveArticle).toHaveBeenCalledTimes(1);
    });

    it('toggles the live preview', async () => {
        const { user } = renderEditor();
        expect(screen.getByTestId('preview')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Hide preview' }));

        expect(screen.queryByTestId('preview')).not.toBeInTheDocument();
    });

    it('inserts a guide snippet into the body and closes the guide', async () => {
        const { user } = renderEditor();
        const textarea = screen.getByLabelText(
            'Article Markdown'
        ) as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: '' } });

        await user.click(screen.getByRole('button', { name: 'Guide' }));
        expect(
            screen.getByRole('dialog', { name: 'Writing guide' })
        ).toBeInTheDocument();
        await user.click(screen.getAllByRole('button', { name: 'Insert' })[0]);

        expect(
            screen.queryByRole('dialog', { name: 'Writing guide' })
        ).not.toBeInTheDocument();
        expect(textarea.value.length).toBeGreaterThan(0);
    });

    it('warns before unloading the tab only while there are unsaved edits', () => {
        renderEditor();
        const cleanUnload = new Event('beforeunload', { cancelable: true });
        window.dispatchEvent(cleanUnload);
        expect(cleanUnload.defaultPrevented).toBe(false);

        fireEvent.change(screen.getByLabelText(/^Title/), {
            target: { value: 'Dirty' },
        });
        const dirtyUnload = new Event('beforeunload', { cancelable: true });
        window.dispatchEvent(dirtyUnload);

        expect(dirtyUnload.defaultPrevented).toBe(true);
    });
});
