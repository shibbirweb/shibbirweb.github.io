import type { UsesBlockData } from '@/components/pages/uses/types';
import SpecList from '@/components/pages/uses/SpecList';
import GearList from '@/components/pages/uses/GearList';
import ExtensionList from '@/components/pages/uses/ExtensionList';
import ResourceLink from '@/components/pages/uses/ResourceLink';
import TagRun from '@/components/pages/uses/TagRun';

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
                <TagRun
                    label={block.label}
                    tags={block.tags}
                />
            );
        case 'gear':
            return <GearList gear={block.gear} />;
        case 'extensions':
            return (
                <ExtensionList
                    label={block.label}
                    extensions={block.extensions}
                />
            );
        case 'link':
            return (
                <ResourceLink
                    label={block.label}
                    title={block.title}
                    href={block.href}
                    description={block.description}
                />
            );
        case 'text':
            return (
                <p className="text-foreground/70 max-w-3xl text-base leading-relaxed">
                    {block.text}
                </p>
            );
    }
}
