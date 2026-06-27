import Tag from '@/components/pages/common/Tag';

interface SkillGroupProps {
    title: string;
    items: string[];
}

export default function SkillGroup({ title, items }: SkillGroupProps) {
    return (
        <div>
            <h3 className="text-2xl font-bold text-foreground/60">{title}</h3>
            <ul className="mt-4 flex flex-wrap gap-3">
                {items.map((item) => (
                    <Tag
                        key={item}
                        className="px-5 py-2 text-xl hover:border-foreground/40"
                    >
                        {item}
                    </Tag>
                ))}
            </ul>
        </div>
    );
}
