import Tag from '@/components/pages/common/Tag';
import { cn } from '@/utils/cn';

interface TagGroupProps {
    label?: string;
    tags: string[];
}

/**
 * An optional sub-heading followed by a wrapped row of pill tags. Shared by the
 * /uses and /now pages.
 */
export default function TagGroup({ label, tags }: TagGroupProps) {
    return (
        <div>
            {label && (
                <h3 className="text-foreground/60 text-xl font-bold">
                    {label}
                </h3>
            )}
            <ul className={cn('flex flex-wrap gap-3', label && 'mt-3')}>
                {tags.map((tag) => (
                    <Tag
                        key={tag}
                        className="hover:border-foreground/40 px-5 py-2 text-xl"
                    >
                        {tag}
                    </Tag>
                ))}
            </ul>
        </div>
    );
}
