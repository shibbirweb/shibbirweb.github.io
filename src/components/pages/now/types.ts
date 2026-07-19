export type NowBlockData =
    | { kind: 'tags'; label?: string; tags: string[] }
    | { kind: 'list'; items: string[] }
    | { kind: 'text'; text: string };

export type NowSectionData = {
    title: string;
    emoji: string;
    intro?: string;
    outro?: string;
    /**
     * Marks a content-heavy section as a feature card that spans two columns in
     * the bento grid (NowGrid). Left undefined for the compact single-column
     * cards. Adding it to a section in contents.ts is all it takes to promote
     * that card to the wider slot. Mirrors the same flag on the /uses page.
     */
    wide?: boolean;
    blocks: NowBlockData[];
};
