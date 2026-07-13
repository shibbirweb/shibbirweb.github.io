/**
 * The gear-guide masthead: a mono dateline, an oversized display headline, and
 * a standfirst with a byline over a heavy rule. This is the page's h1 and its
 * typographic signature, so the display face is set large with tight leading.
 */
export default function Masthead() {
    return (
        <header>
            <p className="text-foreground/45 font-mono text-[11px] tracking-[0.3em] uppercase">
                Field guide · Uses · 2025
            </p>

            <h1 className="font-display mt-5 text-6xl leading-[0.88] font-bold tracking-tight uppercase sm:text-8xl">
                What I
                <br />
                Use
            </h1>

            <div className="border-foreground mt-8 flex flex-col gap-5 border-t-2 pt-6 md:flex-row md:items-end md:justify-between">
                <p className="text-foreground/75 max-w-xl text-lg leading-relaxed">
                    The hardware I build on, the home lab I tinker with, and how my
                    editor and shell are set up. A living record of the tools
                    behind the work, updated as the setup evolves.
                </p>
                <p className="text-foreground/45 shrink-0 font-mono text-xs tracking-wider uppercase">
                    Shibbir Ahmed · Software Engineer
                </p>
            </div>
        </header>
    );
}
