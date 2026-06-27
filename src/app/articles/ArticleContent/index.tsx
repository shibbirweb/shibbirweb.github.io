import { cn } from '@/utils/cn';
import styles from './ArticleContent.module.css';

/**
 * Renders an article's pre-built HTML (Markdown rendered with Shiki code
 * highlighting and inlined gists) as Typography prose. Code-block, inline-code,
 * and gist styling live in the colocated CSS Module.
 */
export default function ArticleContent({ html }: { html: string }) {
    return (
        <div
            className={cn(
                'prose prose-lg dark:prose-invert mt-10 max-w-none',
                styles.content
            )}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
