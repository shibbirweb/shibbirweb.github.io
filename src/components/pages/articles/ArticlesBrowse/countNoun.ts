/** What a topic count counts, in the singular and the plural. */
export interface CountNoun {
    one: string;
    other: string;
}

export const articleNoun: CountNoun = { one: 'article', other: 'articles' };
export const seriesNoun: CountNoun = { one: 'series', other: 'series' };

/** "1 article", "3 articles", "2 series". */
export function formatCount(count: number, noun: CountNoun): string {
    return `${count} ${count === 1 ? noun.one : noun.other}`;
}
