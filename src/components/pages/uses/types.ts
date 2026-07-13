export type UsesBlockData =
    | {
          kind: 'specs';
          label?: string;
          specs: { label: string; value: string }[];
      }
    | { kind: 'tags'; label?: string; tags: string[] }
    | { kind: 'gear'; gear: { name: string; description: string }[] }
    | {
          kind: 'extensions';
          label?: string;
          extensions: {
              name: string;
              publisher: string;
              /** Marketplace item id, "publisher.extension" (e.g. "esbenp.prettier-vscode"). */
              itemName: string;
              description: string;
          }[];
      }
    | {
          kind: 'link';
          label?: string;
          title: string;
          href: string;
          description?: string;
      }
    | { kind: 'text'; text: string };

/** Part of the guide a section belongs to; shown as the entry's eyebrow. */
export type UsesGroup = 'machine' | 'infra' | 'dev';

export type UsesSectionData = {
    title: string;
    group: UsesGroup;
    /** A short standfirst shown under the entry title. */
    intro?: string;
    blocks: UsesBlockData[];
};
