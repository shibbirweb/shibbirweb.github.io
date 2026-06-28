export type NowBlockData =
    | { kind: 'tags'; tags: string[] }
    | { kind: 'list'; items: string[] }
    | { kind: 'text'; text: string }
    | {
          kind: 'subgroups';
          subgroups: { title: string; intro?: string; tags: string[] }[];
      };

export type NowSectionData = {
    title: string;
    emoji: string;
    intro?: string;
    outro?: string;
    blocks: NowBlockData[];
};
