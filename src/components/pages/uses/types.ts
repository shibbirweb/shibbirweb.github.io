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
    blocks: UsesBlockData[];
};
