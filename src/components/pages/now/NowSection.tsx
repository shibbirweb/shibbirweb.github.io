import type { NowSectionData } from '@/components/pages/now/types';
import NowBlock from '@/components/pages/now/NowBlock';

export default function NowSection({ section }: { section: NowSectionData }) {
    return (
        <section>
            <h2 className="text-xl font-bold sm:text-2xl">
                <span
                    aria-hidden="true"
                    className="mr-3"
                >
                    {section.emoji}
                </span>
                {section.title}
            </h2>

            {section.intro && (
                <p className="text-foreground/70 mt-3 max-w-3xl text-base leading-relaxed">
                    {section.intro}
                </p>
            )}

            <div className="mt-6 flex flex-col gap-6">
                {section.blocks.map((block, index) => (
                    <NowBlock
                        key={`${block.kind}-${index}`}
                        block={block}
                    />
                ))}
            </div>

            {section.outro && (
                <p className="text-foreground/70 mt-6 max-w-3xl text-base leading-relaxed">
                    {section.outro}
                </p>
            )}
        </section>
    );
}
