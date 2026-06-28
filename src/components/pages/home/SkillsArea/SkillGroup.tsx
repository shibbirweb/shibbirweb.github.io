import Tag from '@/components/pages/common/Tag';

interface SkillGroupProps {
    title: string;
    items: string[];
}

export default function SkillGroup({ title, items }: SkillGroupProps) {
    return (
        <div>
            <h3 className="text-foreground/60 text-2xl font-bold">{title}</h3>
            <ul className="mt-4 flex flex-wrap gap-3">
                {items.map((item) => (
                    <Tag
                        key={item}
                        className="hover:border-foreground/40 px-5 py-2 text-xl"
                    >
                        {item}
                    </Tag>
                ))}
            </ul>
        </div>
    );
}
