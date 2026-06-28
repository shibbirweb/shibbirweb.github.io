// Next.js ships ambient types for `*.module.css` (and `*.module.scss`) but not
// for plain global stylesheets, so a side-effect import like
// `import '@/app/globals.css'` has no module declaration for the TS server to
// resolve. This wildcard covers global `*.css` side-effect imports. The more
// specific `*.module.css` declaration from Next still wins for CSS Modules.
declare module '*.css';
