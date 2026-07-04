// Placeholder for the dev-only article editor. Step 3 designs the real tree
// (SaveBar + FrontmatterForm + MarkdownInput + EditorPreview) against mocks, and
// Steps 7-8 wire the Server Actions.
export default function ArticleEditor() {
    return (
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-24">
            <p className="text-sm font-medium uppercase tracking-widest text-foreground/50">
                Studio
            </p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Article Editor</h1>
            <p className="mt-4 text-foreground/70">
                Dev-only markdown editor. The interface is coming soon; this route
                exists so the rest of the tooling can be built against it.
            </p>
        </main>
    );
}
