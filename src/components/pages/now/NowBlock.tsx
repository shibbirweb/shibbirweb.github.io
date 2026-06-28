import TagGroup from '@/components/pages/common/TagGroup';
import type { NowBlockData } from '@/components/pages/now/types';
import BulletList from '@/components/pages/now/BulletList';

export default function NowBlock({ block }: { block: NowBlockData }) {
    switch (block.kind) {
        case 'tags':
            return <TagGroup tags={block.tags} />;
        case 'list':
            return <BulletList items={block.items} />;
        case 'text':
            return (
                <p className="text-foreground/80 max-w-3xl text-base leading-relaxed">
                    {block.text}
                </p>
            );
        case 'subgroups':
            return (
                <div className="flex flex-col gap-8">
                    {block.subgroups.map((subgroup) => (
                        <div key={subgroup.title}>
                            <h3 className="text-lg font-semibold">
                                {subgroup.title}
                            </h3>
                            {subgroup.intro && (
                                <p className="text-foreground/70 mt-2 max-w-3xl text-base leading-relaxed">
                                    {subgroup.intro}
                                </p>
                            )}
                            <div className="mt-4">
                                <TagGroup tags={subgroup.tags} />
                            </div>
                        </div>
                    ))}
                </div>
            );
    }
}
