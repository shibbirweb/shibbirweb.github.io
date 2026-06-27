import type { UsesBlockData } from './contents';
import SpecList from './SpecList';
import GearList from './GearList';
import TagGroup from '@/components/pages/common/TagGroup';

export default function UsesBlock({ block }: { block: UsesBlockData }) {
    switch (block.kind) {
        case 'specs':
            return (
                <SpecList
                    label={block.label}
                    specs={block.specs}
                />
            );
        case 'tags':
            return (
                <TagGroup
                    label={block.label}
                    tags={block.tags}
                />
            );
        case 'gear':
            return <GearList gear={block.gear} />;
        case 'text':
            return (
                <p className="text-foreground/70 max-w-3xl text-xl leading-normal">
                    {block.text}
                </p>
            );
    }
}
