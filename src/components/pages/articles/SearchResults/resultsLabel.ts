// The lead-in before the quoted query in the result count. A pure decision table,
// so it lives here rather than inline: written as an expression it was a ternary
// inside a ternary, which hid which of the three phrasings actually ran.

/** "No articles found for", or the count with the noun agreeing with it. */
export function resolveResultsLabel(count: number): string {
    if (count === 0) return 'No articles found for ';
    if (count === 1) return '1 article found for ';
    return `${count} articles found for `;
}
