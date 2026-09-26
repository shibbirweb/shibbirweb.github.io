import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMarkdownInsertion } from '@/components/pages/article-editor/ArticleEditor/hooks/useMarkdownInsertion';

let insert: (text: string) => void = () => {};

function Editor({
    initialBody,
    withTextarea = true,
}: {
    initialBody: string;
    withTextarea?: boolean;
}) {
    const [body, setBody] = useState(initialBody);
    const { textareaRef, insertSnippet } = useMarkdownInsertion(body, setBody);
    insert = insertSnippet;

    return (
        <>
            {withTextarea && (
                <textarea
                    aria-label="Body"
                    ref={textareaRef}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                />
            )}
            <output data-testid="body">{body}</output>
        </>
    );
}

function insertAndSettle(text: string) {
    act(() => {
        insert(text);
    });
    act(() => {
        vi.advanceTimersByTime(16);
    });
}

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame'] });
});

afterEach(() => {
    vi.useRealTimers();
});

describe('useMarkdownInsertion', () => {
    it('inserts the snippet at the caret', () => {
        render(<Editor initialBody="Hello world" />);
        const textarea = screen.getByLabelText('Body') as HTMLTextAreaElement;
        textarea.setSelectionRange(5, 5);

        insertAndSettle(',');

        expect(textarea).toHaveValue('Hello, world');
    });

    it('replaces the selected text', () => {
        render(<Editor initialBody="Hello world" />);
        const textarea = screen.getByLabelText('Body') as HTMLTextAreaElement;
        textarea.setSelectionRange(6, 11);

        insertAndSettle('there');

        expect(textarea).toHaveValue('Hello there');
    });

    it('refocuses the textarea with the caret after the inserted text', () => {
        render(<Editor initialBody="ab" />);
        const textarea = screen.getByLabelText('Body') as HTMLTextAreaElement;
        textarea.setSelectionRange(1, 1);
        textarea.blur();

        insertAndSettle('XYZ');

        expect(textarea).toHaveFocus();
        expect(textarea.selectionStart).toBe(4);
        expect(textarea.selectionEnd).toBe(4);
    });

    it('defers the refocus to the next animation frame', () => {
        render(<Editor initialBody="ab" />);
        const textarea = screen.getByLabelText('Body') as HTMLTextAreaElement;
        textarea.blur();

        act(() => {
            insert('!');
        });
        expect(textarea).not.toHaveFocus();

        act(() => {
            vi.advanceTimersByTime(16);
        });
        expect(textarea).toHaveFocus();
    });

    it('appends to the end of the body when there is no textarea', () => {
        render(
            <Editor
                initialBody="Intro"
                withTextarea={false}
            />
        );

        insertAndSettle('\n\n## Next');

        expect(screen.getByTestId('body').textContent).toBe('Intro\n\n## Next');
    });
});
