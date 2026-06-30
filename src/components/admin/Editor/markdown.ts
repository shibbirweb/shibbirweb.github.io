/**
 * Pure text transforms for the Markdown editor. Each takes and returns an
 * `EditorState` (value + selection) so the editing surface stays a controlled
 * textarea and every formatting action is testable in isolation, with no DOM.
 */
export interface EditorState {
    value: string;
    start: number;
    end: number;
}

function lineStart(value: string, index: number): number {
    return value.lastIndexOf('\n', index - 1) + 1;
}

function lineEnd(value: string, index: number): number {
    const next = value.indexOf('\n', index);
    return next === -1 ? value.length : next;
}

/** Wrap the selection in `before`/`after`, toggling the markers off if present. */
export function surround(
    state: EditorState,
    before: string,
    after: string,
    placeholder = 'text'
): EditorState {
    const { value, start, end } = state;
    const selected = value.slice(start, end);

    if (selected) {
        const wrapped =
            value.slice(start - before.length, start) === before &&
            value.slice(end, end + after.length) === after;
        if (wrapped) {
            return {
                value:
                    value.slice(0, start - before.length) +
                    selected +
                    value.slice(end + after.length),
                start: start - before.length,
                end: end - before.length,
            };
        }
        return {
            value: value.slice(0, start) + before + selected + after + value.slice(end),
            start: start + before.length,
            end: end + before.length,
        };
    }

    const inserted = before + placeholder + after;
    return {
        value: value.slice(0, start) + inserted + value.slice(end),
        start: start + before.length,
        end: start + before.length + placeholder.length,
    };
}

export function inline(
    state: EditorState,
    marker: string,
    placeholder?: string
): EditorState {
    return surround(state, marker, marker, placeholder);
}

/** Map every line touched by the selection through `transform`. */
function mapSelectedLines(
    state: EditorState,
    transform: (line: string, index: number, allHavePrefix: boolean) => string,
    hasPrefix?: (line: string) => boolean
): EditorState {
    const { value, start, end } = state;
    const from = lineStart(value, start);
    const to = lineEnd(value, end);
    const lines = value.slice(from, to).split('\n');
    const meaningful = lines.filter((line) => line.trim() !== '');
    const allHavePrefix = hasPrefix
        ? meaningful.length > 0 && meaningful.every(hasPrefix)
        : false;
    const replaced = lines
        .map((line, index) => transform(line, index, allHavePrefix))
        .join('\n');
    return {
        value: value.slice(0, from) + replaced + value.slice(to),
        start: from,
        end: from + replaced.length,
    };
}

const HEADING_PREFIX = /^#{1,6}\s+/;

/** Set (or clear, with level 0) the heading level of the selected lines. */
export function heading(state: EditorState, level: number): EditorState {
    return mapSelectedLines(state, (line) => {
        const bare = line.replace(HEADING_PREFIX, '');
        return level === 0 ? bare : `${'#'.repeat(level)} ${bare}`;
    });
}

const LIST_PREFIXES = /^(\s*)([-*+]\s+\[[ xX]\]\s+|[-*+]\s+|\d+\.\s+|>\s+)/;

function strip(line: string): string {
    return line.replace(LIST_PREFIXES, '$1');
}

export function bulletList(state: EditorState): EditorState {
    return mapSelectedLines(
        state,
        (line, _index, allHave) =>
            line.trim() === ''
                ? line
                : allHave
                  ? strip(line)
                  : `- ${strip(line)}`,
        (line) => /^\s*[-*+]\s+/.test(line)
    );
}

export function numberedList(state: EditorState): EditorState {
    let counter = 0;
    return mapSelectedLines(
        state,
        (line, _index, allHave) => {
            if (line.trim() === '') return line;
            if (allHave) return strip(line);
            counter += 1;
            return `${counter}. ${strip(line)}`;
        },
        (line) => /^\s*\d+\.\s+/.test(line)
    );
}

export function taskList(state: EditorState): EditorState {
    return mapSelectedLines(
        state,
        (line, _index, allHave) =>
            line.trim() === ''
                ? line
                : allHave
                  ? strip(line)
                  : `- [ ] ${strip(line)}`,
        (line) => /^\s*[-*+]\s+\[[ xX]\]\s+/.test(line)
    );
}

export function quote(state: EditorState): EditorState {
    return mapSelectedLines(
        state,
        (line, _index, allHave) =>
            line.trim() === ''
                ? line
                : allHave
                  ? line.replace(/^>\s?/, '')
                  : `> ${line}`,
        (line) => /^>\s?/.test(line)
    );
}

/**
 * Insert a standalone block at the cursor, padded with blank lines so it never
 * fuses with surrounding text. A `$0` token in `block` marks the caret position.
 */
export function insertBlock(state: EditorState, block: string): EditorState {
    const { value, start, end } = state;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const prefix =
        before === '' || before.endsWith('\n\n')
            ? ''
            : before.endsWith('\n')
              ? '\n'
              : '\n\n';
    const suffix =
        after === '' || after.startsWith('\n\n')
            ? ''
            : after.startsWith('\n')
              ? '\n'
              : '\n\n';

    let body = prefix + block + suffix;
    const caretToken = body.indexOf('$0');
    let caret: number;
    if (caretToken >= 0) {
        body = body.replace('$0', '');
        caret = before.length + caretToken;
    } else {
        caret = before.length + prefix.length + block.length;
    }
    return { value: before + body + after, start: caret, end: caret };
}

/** Replace the current selection with `text`, leaving the caret after it. */
export function replaceSelection(state: EditorState, text: string): EditorState {
    const { value, start, end } = state;
    const caret = start + text.length;
    return {
        value: value.slice(0, start) + text + value.slice(end),
        start: caret,
        end: caret,
    };
}
