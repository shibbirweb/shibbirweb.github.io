/** One row in the writing guide: a labelled convention with an example snippet. */
export interface GuideEntry {
    label: string;
    /** What the field or feature is for, and which form control drives it. */
    note: string;
    /** The example shown in the guide and copied by the Copy button. */
    snippet: string;
    /**
     * Body-feature text spliced into the Markdown textarea by the Insert button.
     * Omitted for frontmatter entries, which are authored through the form.
     */
    insert?: string;
}

export interface GuideGroup {
    title: string;
    entries: GuideEntry[];
}
