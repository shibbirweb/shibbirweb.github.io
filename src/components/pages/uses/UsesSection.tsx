import type { UsesSectionData } from '@/components/pages/uses/types';
import UsesBlock from '@/components/pages/uses/UsesBlock';

export default function UsesSection({ section }: { section: UsesSectionData }) {
    return (
        <section>
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
                <span
                    aria-hidden="true"
                    className="mr-3"
                >
                    {section.emoji}
                </span>
                {section.title}
            </h2>

            {section.intro && (
                <p className="text-foreground/70 mt-3 max-w-3xl text-2xl leading-normal">
                    {section.intro}
                </p>
            )}

            <div className="mt-6 flex flex-col gap-6">
                {section.blocks.map((block, index) => (
                    <UsesBlock
                        key={`${block.kind}-${index}`}
                        block={block}
                    />
                ))}
            </div>
        </section>
    );
}
