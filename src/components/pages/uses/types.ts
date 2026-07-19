export type UsesBlockData =
    | {
          kind: 'specs';
          label?: string;
          specs: { label: string; value: string }[];
      }
    | { kind: 'tags'; label?: string; tags: string[] }
    | { kind: 'gear'; gear: { name: string; description: string }[] }
    | { kind: 'text'; text: string };

export type UsesSectionData = {
    title: string;
    emoji: string;
    intro?: string;
    /**
     * Marks a content-heavy section as a feature card that spans two columns in
     * the bento grid (UsesGrid). Left undefined for the compact single-column
     * cards. Adding it to a section in contents.ts is all it takes to promote
     * that card to the wider slot.
     */
    wide?: boolean;
    blocks: UsesBlockData[];
};
