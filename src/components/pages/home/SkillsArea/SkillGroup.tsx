import Tag from '@/components/pages/common/Tag';

interface SkillGroupProps {
    title: string;
    items: string[];
}

export default function SkillGroup({ title, items }: SkillGroupProps) {
    return (
        <div>
            <h3 className="text-foreground/60 text-lg font-bold">{title}</h3>
            <ul className="mt-4 flex flex-wrap gap-2.5">
                {items.map((item) => (
                    <Tag
                        key={item}
                        className="hover:border-foreground/40 px-4 py-1.5 text-sm"
                    >
                        {item}
                    </Tag>
                ))}
            </ul>
        </div>
    );
}
