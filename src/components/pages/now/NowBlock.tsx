import TagGroup from '@/components/pages/common/TagGroup';
import type { NowBlockData } from '@/components/pages/now/types';
import BulletList from '@/components/pages/now/BulletList';

/**
 * Renders one content block inside a /now card, the sibling of UsesBlock.
 */
export default function NowBlock({ block }: { block: NowBlockData }) {
    switch (block.kind) {
        case 'tags':
            return (
                <TagGroup
                    label={block.label}
                    tags={block.tags}
                />
            );
        case 'list':
            return <BulletList items={block.items} />;
        case 'text':
            return (
                <p className="text-foreground/70 text-sm leading-relaxed">
                    {block.text}
                </p>
            );
    }
}
