import { builtinModules } from 'node:module';
import path from 'node:path';

// A small static import walker for the client bundle guard
// (tests/architecture/clientImports.test.ts).
//
// Next bundles every file a 'use client' module imports, directly or through any
// number of other modules, for the browser. A Node-only module (node:fs,
// node:crypto, ...) anywhere in that chain breaks the bundle, but only when the
// route is compiled: unit tests run in Node, where the import works, and dev-only
// routes never reach `pnpm build`. Walking the imports statically catches it in
// milliseconds, before any bundler runs.

/** Repo-relative path (e.g. `src/lib/markdown.ts`) to that file's source. */
export type SourceFiles = Map<string, string>;

export interface NodeOnlyImport {
    /** The import chain, from the client entry to the file with the import. */
    chain: string[];
    /** The Node-only module it imports, e.g. `node:fs`. */
    specifier: string;
}

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

const NODE_BUILTINS = new Set(
    builtinModules.filter((name) => !name.startsWith('_'))
);

/** `import x from '...'`, `import { a } from '...'`, `export * from '...'`. */
const FROM_PATTERN =
    /^\s*(import|export)\s+(type\s+)?([^;=()'"]*?)\s*from\s+['"]([^'"]+)['"]/gm;
/** `import '...'` for side effects only. */
const SIDE_EFFECT_PATTERN = /^\s*import\s+['"]([^'"]+)['"]/gm;
/** `import('...')`, as used by next/dynamic and lazy loaders. */
const DYNAMIC_PATTERN = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
/** Leading whitespace and comments, which may sit above a directive. */
const LEADING_TRIVIA_PATTERN = /^(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/)*/;

/** Whether `specifier` names a Node built-in (`node:fs`, `fs`, `fs/promises`). */
export function isNodeOnlyModule(specifier: string): boolean {
    if (specifier.startsWith('node:')) {
        return true;
    }
    return NODE_BUILTINS.has(specifier);
}

/** The file's leading directive (`use client` / `use server`), if it has one. */
export function directiveOf(source: string): string | null {
    const body = source.replace(LEADING_TRIVIA_PATTERN, '');
    return body.match(/^['"](use client|use server)['"]/)?.[1] ?? null;
}

/**
 * Every module specifier a file loads at runtime. Type-only imports are left
 * out, because TypeScript erases them and they never reach a bundle.
 */
export function runtimeImports(source: string): string[] {
    const specifiers: string[] = [];
    for (const match of source.matchAll(FROM_PATTERN)) {
        const [, , typeKeyword, clause, specifier] = match;
        if (typeKeyword || isTypeOnlyClause(clause)) {
            continue;
        }
        specifiers.push(specifier);
    }
    for (const match of source.matchAll(SIDE_EFFECT_PATTERN)) {
        specifiers.push(match[1]);
    }
    for (const match of source.matchAll(DYNAMIC_PATTERN)) {
        specifiers.push(match[1]);
    }
    return specifiers;
}

/** `{ type A, type B }`: every named import is a type, so TypeScript drops it. */
function isTypeOnlyClause(clause: string): boolean {
    const named = clause.trim().match(/^\{([\s\S]*)\}$/);
    if (!named) {
        return false;
    }
    const items = named[1]
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    return items.length > 0 && items.every((item) => item.startsWith('type '));
}

/**
 * The project file an import points at, or null for a package, an asset, or a
 * path that is not in `files`. `@/x` maps to `src/x`.
 */
export function resolveImport(
    specifier: string,
    importer: string,
    files: SourceFiles
): string | null {
    let base: string;
    if (specifier.startsWith('@/')) {
        base = `src/${specifier.slice(2)}`;
    } else if (specifier.startsWith('.')) {
        base = path.posix.join(path.posix.dirname(importer), specifier);
    } else {
        return null;
    }
    const candidates = [
        base,
        ...SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
        ...SOURCE_EXTENSIONS.map((extension) => `${base}/index${extension}`),
    ];
    return candidates.find((candidate) => files.has(candidate)) ?? null;
}

/**
 * Walks every import reachable from `entries` and reports each Node-only module
 * found, with the chain that reaches it. A `use server` file ends the walk:
 * Next sends the browser a reference to its Server Actions, not its code.
 */
export function findNodeOnlyImports(
    entries: string[],
    files: SourceFiles
): NodeOnlyImport[] {
    const found: NodeOnlyImport[] = [];
    const visited = new Set<string>();
    const queue = entries.map((entry) => [entry]);

    while (queue.length > 0) {
        const chain = queue.shift() as string[];
        const file = chain[chain.length - 1];
        if (visited.has(file)) {
            continue;
        }
        visited.add(file);

        const source = files.get(file);
        if (source === undefined) {
            continue;
        }
        const isEntry = chain.length === 1;
        if (!isEntry && directiveOf(source) === 'use server') {
            continue;
        }

        for (const specifier of runtimeImports(source)) {
            if (isNodeOnlyModule(specifier)) {
                found.push({ chain, specifier });
                continue;
            }
            const target = resolveImport(specifier, file, files);
            if (target && !visited.has(target)) {
                queue.push([...chain, target]);
            }
        }
    }
    return found;
}

/** One readable line per finding, for an assertion message. */
export function describeNodeOnlyImport(finding: NodeOnlyImport): string {
    return `${finding.chain.join(' -> ')} imports ${finding.specifier}`;
}
