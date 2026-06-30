/**
 * Compute the pixel coordinates of the caret inside a textarea, by mirroring its
 * text into an off-screen div with the same typography and measuring where a
 * marker span lands. Adapted from the MIT-licensed textarea-caret-position
 * technique; it is the only reliable way to anchor a slash menu at the caret
 * when the text wraps.
 */
const MIRRORED_PROPERTIES = [
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'letterSpacing',
    'wordSpacing',
    'tabSize',
    'whiteSpace',
    'wordWrap',
] as const;

export interface CaretCoordinates {
    top: number;
    left: number;
    height: number;
}

export function getCaretCoordinates(
    element: HTMLTextAreaElement,
    position: number
): CaretCoordinates {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const style = div.style;
    const computed = window.getComputedStyle(element);

    style.position = 'absolute';
    style.visibility = 'hidden';
    style.whiteSpace = 'pre-wrap';
    style.wordWrap = 'break-word';

    const target = style as unknown as Record<string, string>;
    const source = computed as unknown as Record<string, string>;
    for (const property of MIRRORED_PROPERTIES) {
        target[property] = source[property];
    }

    div.textContent = element.value.slice(0, position);
    const span = document.createElement('span');
    span.textContent = element.value.slice(position) || '.';
    div.appendChild(span);

    // Border/line-height can compute to keywords ("medium", "normal") that
    // parseInt cannot read; fall back to 0 / the measured span height so the
    // menu is never positioned at NaN.
    const px = (value: string) => parseInt(value, 10) || 0;
    const coordinates: CaretCoordinates = {
        top: span.offsetTop + px(computed.borderTopWidth),
        left: span.offsetLeft + px(computed.borderLeftWidth),
        height: px(computed.lineHeight) || span.offsetHeight,
    };

    document.body.removeChild(div);
    return coordinates;
}
