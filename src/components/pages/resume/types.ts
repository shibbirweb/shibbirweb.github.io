/** A single contact link in the resume header (email, LinkedIn, GitHub, site). */
export type ContactLink = {
    /** Human-readable label shown in the header (e.g. `github.com/shibbirweb`). */
    label: string;
    /** Destination (`mailto:` for email, `https:` for the rest). */
    href: string;
};

/** One role held at a company (a company can have several over time). */
export type ExperiencePosition = {
    role: string;
    /** Employment period, e.g. `Oct 2024 - Present`. */
    period: string;
    /** Achievement bullets shown under the role. */
    highlights?: string[];
    /** Optional "Technologies:" line under the bullets. */
    tech?: string[];
};

/** One company in the Work Experience section, with its role(s). */
export type ExperienceEntry = {
    company: string;
    companyURL?: string;
    location?: string;
    /** Roles held at this company, most recent first. */
    positions: ExperiencePosition[];
};

/** One entry in the Projects section. */
export type ProjectEntry = {
    name: string;
    /** Short tagline shown after the name, separated by a middot. */
    tagline?: string;
    /** Company/context the project was built at (shown under the name). */
    company?: string;
    highlights?: string[];
    tech?: string[];
    /** Live URL if it exists, otherwise the repository URL. */
    url?: string;
};

/** One labelled row in the Technical Skills section (label + values). */
export type SkillGroup = {
    label: string;
    values: string[];
};

/** One institution in the Education section. */
export type EducationEntry = {
    institution: string;
    institutionURL?: string;
    degree: string;
    year: string;
};

/** One entry in the Honors & Awards section. */
export type AwardEntry = {
    title: string;
    /** Who issued it (company/organization). */
    issuer?: string;
    /** When it was awarded, e.g. `Jul 2025`. */
    date: string;
};

/**
 * A resume section, keyed by `kind` (mirrors the `UsesSectionData` union so the
 * layout stays data-driven). Adding a section that reuses an existing `kind` is
 * a one-line append to `resumeSections`; a brand-new layout adds a `kind` here,
 * a `case` in `ResumeSectionBlock`, and a body component. `label` is the accent
 * heading rendered by the shared `ResumeSection` shell.
 */
export type ResumeSectionData =
    | { kind: 'experience'; label: string; entries: ExperienceEntry[] }
    | { kind: 'projects'; label: string; entries: ProjectEntry[] }
    | { kind: 'skills'; label: string; groups: SkillGroup[] }
    | { kind: 'bullets'; label: string; items: string[] }
    | { kind: 'education'; label: string; entries: EducationEntry[] }
    | { kind: 'awards'; label: string; entries: AwardEntry[] }
    | { kind: 'text'; label: string; text: string };
