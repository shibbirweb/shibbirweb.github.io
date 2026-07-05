import GuideEntry from '@/components/pages/article-editor/ArticleEditor/WritingGuide/GuideEntry';
import type { GuideEntry as GuideEntryData } from '@/components/pages/article-editor/ArticleEditor/WritingGuide/types';

export default function GuideSection({
    title,
    entries,
    onInsert,
}: {
    title: string;
    entries: GuideEntryData[];
    onInsert: (snippet: string) => void;
}) {
    return (
        <section>
            <h3 className="text-foreground/45 text-xs font-semibold tracking-[0.2em] uppercase">
                {title}
            </h3>
            <div className="mt-3 grid gap-3">
                {entries.map((entry) => (
                    <GuideEntry
                        key={entry.label}
                        entry={entry}
                        onInsert={onInsert}
                    />
                ))}
            </div>
        </section>
    );
}
