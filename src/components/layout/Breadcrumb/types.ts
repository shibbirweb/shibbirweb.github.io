export interface BreadcrumbItem {
    /** Mono display text for the segment, e.g. `~`, `articles`, the slug. */
    label: string;
    /** Route the segment points to. The final (current) item renders as plain
     *  text, but still carries its href so the JSON-LD gets a full URL. */
    href: string;
    /** Human-readable name for the BreadcrumbList JSON-LD; falls back to label. */
    name?: string;
}
