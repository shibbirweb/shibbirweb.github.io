import { Fragment } from 'react';

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Renders `text` with any substrings matching one of `terms` wrapped in a
 * highlighted <mark>, so the part of a title or tag that satisfied the search is
 * visible in suggestions. Builds React nodes (never raw HTML) to keep it safe.
 */
export default function HighlightedText({
    text,
    terms,
}: {
    text: string;
    terms: string[];
}) {
    const cleaned = terms.map((term) => term.trim()).filter(Boolean);
    if (cleaned.length === 0) return <>{text}</>;

    const pattern = cleaned.map(escapeRegExp).join('|');
    // Capturing group keeps the matched delimiters in the split output.
    const splitter = new RegExp(`(${pattern})`, 'ig');
    const isMatch = new RegExp(`^(?:${pattern})$`, 'i');

    return (
        <>
            {text
                .split(splitter)
                .filter((part) => part.length > 0)
                .map((part, index) =>
                    isMatch.test(part) ? (
                        <mark
                            key={index}
                            className="bg-foreground/15 text-foreground rounded-[0.25rem] px-0.5"
                        >
                            {part}
                        </mark>
                    ) : (
                        <Fragment key={index}>{part}</Fragment>
                    )
                )}
        </>
    );
}
