import { THEME_STORAGE_KEY } from '@/components/layout/ThemeToggle/theme';

// Applies the persisted theme to <html> before the first paint, so a saved
// light/dark choice never flashes the wrong theme on load. This mirrors
// resolvePreference/applyPreference in theme.ts and must stay in sync with them.
// It is intentionally tiny and dependency-free (it is inlined and blocks the
// first paint) and is NOT gated on NODE_ENV, since it must run in dev too.
const script = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY
)});var t=(p==='light'||p==='dark')?p:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var d=document.documentElement;d.setAttribute('data-theme',t);d.style.colorScheme=t;}catch(e){}})();`;

export function ThemeScript() {
    return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
