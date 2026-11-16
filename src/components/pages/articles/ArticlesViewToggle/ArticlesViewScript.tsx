import {
    ARTICLES_VIEW_ATTRIBUTE,
    ARTICLES_VIEW_STORAGE_KEY,
} from '@/components/pages/articles/ArticlesViewToggle/articlesView';

// Marks <html> with the saved articles layout before the first paint, so the
// pre-rendered list can stay hidden for a visitor who chose the grid (see
// ArticlesIndexFallback and SeriesIndex.module.css). Mirrors getStoredArticlesView/applyArticlesView in
// articlesView.ts and must stay in sync with them. Tiny, dependency-free and
// wrapped in try/catch, like ThemeScript, since it is inlined and blocking. It
// renders in the root layout's <head>, next to ThemeScript.
const script = `(function(){try{var v=localStorage.getItem(${JSON.stringify(
    ARTICLES_VIEW_STORAGE_KEY
)});if(v==='grid'||v==='list'){document.documentElement.setAttribute(${JSON.stringify(
    ARTICLES_VIEW_ATTRIBUTE
)},v);}}catch(e){}})();`;

export default function ArticlesViewScript() {
    return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
