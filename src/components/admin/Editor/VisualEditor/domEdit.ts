/**
 * Selection-and-range helpers for editing the contentEditable WYSIWYG surface.
 * Everything is scoped to the editor root so edits never escape it, and the
 * caret is left somewhere sensible after each operation.
 */

/** The current selection range, but only if it lives inside `root`. */
export function selectionRange(root: HTMLElement): Range | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    return root.contains(range.commonAncestorContainer) ? range : null;
}

/** The top-level block element (a direct child of `root`) containing `node`. */
export function topLevelBlock(root: HTMLElement, node: Node): HTMLElement | null {
    let current: Node | null = node;
    while (current && current.parentNode && current.parentNode !== root) {
        current = current.parentNode;
    }
    return current && current.parentNode === root && current instanceof HTMLElement
        ? current
        : null;
}

function setSelection(range: Range): void {
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

function caretAt(node: Node, offset: number): void {
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    setSelection(range);
}

function caretAfter(node: Node): void {
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    setSelection(range);
}

function selectContents(node: Node): void {
    const range = document.createRange();
    range.selectNodeContents(node);
    setSelection(range);
}

/** Wrap the current selection in an inline element (e.g. `code`, `mark`). */
export function wrapSelection(root: HTMLElement, tag: string): void {
    const range = selectionRange(root);
    if (!range) return;
    const element = document.createElement(tag);
    if (range.collapsed) {
        element.appendChild(document.createTextNode('​'));
        range.insertNode(element);
        caretAt(element.firstChild!, 1);
    } else {
        element.appendChild(range.extractContents());
        range.insertNode(element);
        selectContents(element);
    }
}

/** Replace the selection with inline HTML (e.g. a link), caret left after it. */
export function insertInlineHtml(root: HTMLElement, fragment: DocumentFragment): void {
    const range = selectionRange(root);
    if (!range) return;
    range.deleteContents();
    const last = fragment.lastChild;
    range.insertNode(fragment);
    if (last) caretAfter(last);
}

/** Insert block-level nodes after the current block (or replace it if empty). */
export function insertBlock(root: HTMLElement, fragment: DocumentFragment): void {
    const range = selectionRange(root);
    const anchor = range
        ? topLevelBlock(root, range.startContainer)
        : root.lastElementChild;
    const lastNode = fragment.lastChild;

    if (anchor instanceof HTMLElement) {
        const empty =
            anchor.children.length === 0 &&
            (anchor.textContent ?? '').trim() === '';
        if (empty) anchor.replaceWith(fragment);
        else anchor.after(fragment);
    } else {
        root.appendChild(fragment);
    }
    if (lastNode) caretAfter(lastNode);
}

/** Swap an atomic widget element for freshly rendered nodes. */
export function replaceElement(target: Element, fragment: DocumentFragment): void {
    const lastNode = fragment.lastChild;
    target.replaceWith(fragment);
    if (lastNode) caretAfter(lastNode);
}

function caretIntoBlock(block: Element): void {
    const range = document.createRange();
    range.selectNodeContents(block);
    range.collapse(false);
    setSelection(range);
}

/** Move the block containing the caret up (-1) or down (+1) among siblings. */
export function moveBlock(root: HTMLElement, direction: -1 | 1): boolean {
    const range = selectionRange(root);
    if (!range) return false;
    const block = topLevelBlock(root, range.startContainer);
    if (!block) return false;
    const sibling =
        direction < 0
            ? block.previousElementSibling
            : block.nextElementSibling;
    if (!sibling) return false;
    if (direction < 0) sibling.before(block);
    else sibling.after(block);
    caretIntoBlock(block);
    return true;
}

/** Duplicate the block containing the caret, placing the copy right after it. */
export function duplicateBlock(root: HTMLElement): boolean {
    const range = selectionRange(root);
    if (!range) return false;
    const block = topLevelBlock(root, range.startContainer);
    if (!block) return false;
    const clone = block.cloneNode(true) as HTMLElement;
    block.after(clone);
    caretIntoBlock(clone);
    return true;
}
