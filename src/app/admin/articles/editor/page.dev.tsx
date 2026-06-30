import { Suspense } from 'react';
import ArticleEditor from '@/components/admin/Editor';

export default function ArticleEditorPage() {
    return (
        <Suspense fallback={null}>
            <ArticleEditor />
        </Suspense>
    );
}
