/**
 * A system monospace stack for the projects section's metadata (numbers,
 * categories, stack, links). Deliberately not `font-mono`: JetBrains Mono is
 * only loaded on the resume, so the home page uses the visitor's own mono face
 * and downloads no extra font.
 */
export const monoTextClassName =
    'font-[ui-monospace,SFMono-Regular,Menlo,Consolas,monospace]';
