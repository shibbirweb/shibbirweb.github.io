import { jetBrainsMono } from '@/config/monoFont';
import { accentStyle } from '@/utils/accentStyle';
import { cn } from '@/utils/cn';
import styles from '@/components/pages/articles/ArticleContent/ArticleContent.module.css';

/**
 * Renders an article's pre-built HTML (Markdown rendered with Shiki code
 * highlighting and inlined gists) as Typography prose. Code-block, inline-code,
 * and gist styling live in the colocated CSS Module.
 *
 * The optional cover accent is exposed as --accent-from / --accent-to (via
 * accentStyle) so the code-block hover bloom can tint to the article's cover
 * colour, the same colour the active "On this page" marker uses. It is omitted
 * in the editor preview, where the bloom falls back to emerald.
 */
export default function ArticleContent({
    html,
    accentColors,
}: {
    html: string;
    accentColors?: readonly [string, string];
}) {
    return (
        <div
            style={accentColors ? accentStyle(accentColors) : undefined}
            className={cn(
                jetBrainsMono.variable,
                // Cap the reading measure at ~75ch so body lines stay in the
                // 65-75ch readability range on wide (xl/2xl) screens instead of
                // stretching to the full content column.
                'prose prose-lg dark:prose-invert mt-10 max-w-[75ch]',
                styles.content
            )}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
