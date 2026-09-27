import { describe, expect, it } from 'vitest';
import { nowMeta, nowQuote, nowSections } from '@/app/now/contents';
import {
    resumeContacts,
    resumeLocation,
    resumeName,
    resumeSections,
} from '@/app/resume/contents';
import { usesSections } from '@/app/uses/contents';
import {
    articlesItem,
    heroId,
    homeSectionIds,
    pageItems,
    resumeItem,
    sectionItems,
    studioItems,
} from '@/components/layout/Navbar/contents';
import { facets } from '@/components/pages/home/AboutMeArea/contents';
import {
    contactFields,
    emptyContactValues,
    messageField,
} from '@/components/pages/home/ContactArea/contents';
import { socialLinks } from '@/components/pages/home/HeroArea/contents';
import {
    collapsedPackageProjectCount,
    collapsedPersonalProjectCount,
    packageProjects,
    personalProjects,
} from '@/components/pages/home/ProjectsArea/contents';
import { skills } from '@/components/pages/home/SkillsArea/contents';
import type { NowBlockData } from '@/components/pages/now/types';
import type { ResumeSectionData } from '@/components/pages/resume/types';
import type { UsesBlockData } from '@/components/pages/uses/types';

// The page and section data files are hand-edited, so these checks catch the
// slips a type checker cannot: duplicates, empty strings, non-https links, and
// section ids that no longer line up with the navbar.

const HTTPS_URL = /^https:\/\/[^\s]+$/;

function expectUnique(values: string[]) {
    const duplicates = values.filter(
        (value, index) => values.indexOf(value) !== index
    );
    expect(duplicates).toEqual([]);
}

function expectFilledText(value: unknown) {
    expect(typeof value).toBe('string');
    expect((value as string).trim()).not.toBe('');
}

function expectFilledList(values: unknown) {
    expect(Array.isArray(values)).toBe(true);
    expect((values as unknown[]).length).toBeGreaterThan(0);
    for (const value of values as unknown[]) {
        expectFilledText(value);
    }
}

/** Function components are functions; memo or forwardRef wrappers are objects. */
function expectComponent(candidate: unknown) {
    expect(['function', 'object']).toContain(typeof candidate);
    expect(candidate).not.toBeNull();
}

describe('Navbar contents', () => {
    const allItems = [
        ...sectionItems,
        articlesItem,
        ...pageItems,
        resumeItem,
        ...studioItems,
    ];

    it('gives every item a label and a site-relative href', () => {
        for (const item of allItems) {
            expectFilledText(item.label);
            expect(item.href).toMatch(/^[/#]/);
        }
    });

    it('uses unique labels and hrefs', () => {
        expectUnique(allItems.map((item) => item.label));
        expectUnique(allItems.map((item) => item.href));
    });

    it('lists each home section id once', () => {
        expectUnique(homeSectionIds);
    });

    it('only links sections that the scroll spy tracks', () => {
        for (const item of sectionItems) {
            expect(homeSectionIds).toContain(item.sectionId);
        }
    });

    it('points each section link at its own anchor', () => {
        for (const item of sectionItems) {
            expect(item.href.endsWith(`#${item.sectionId}`)).toBe(true);
        }
    });

    it('keeps the hero id apart from the section ids', () => {
        expectFilledText(heroId);
        expect(homeSectionIds).not.toContain(heroId);
    });
});

describe('HeroArea social links', () => {
    it('has links', () => {
        expect(socialLinks.length).toBeGreaterThan(0);
    });

    it('uses unique names and hrefs', () => {
        expectUnique(socialLinks.map((link) => link.name));
        expectUnique(socialLinks.map((link) => link.href));
    });

    it('links over https and ships an icon for each', () => {
        for (const link of socialLinks) {
            expectFilledText(link.name);
            expect(link.href).toMatch(HTTPS_URL);
            expectComponent(link.Icon);
        }
    });
});

describe('SkillsArea skills', () => {
    it('uses unique names', () => {
        expectUnique(skills.map((skill) => skill.name));
    });

    it('gives every skill a name and an icon component', () => {
        for (const skill of skills) {
            expectFilledText(skill.name);
            expectComponent(skill.Icon);
        }
    });

    it('sets a non-empty colour whenever one is given', () => {
        for (const skill of skills) {
            if (skill.color !== undefined) {
                expectFilledText(skill.color);
            }
        }
    });
});

describe('ProjectsArea projects', () => {
    const allProjects = [...packageProjects, ...personalProjects];

    it('uses unique names across both lists', () => {
        expectUnique(allProjects.map((project) => project.name));
    });

    it('fills in each project and lists its tech', () => {
        for (const project of allProjects) {
            expectFilledText(project.name);
            expectFilledText(project.category);
            expectFilledText(project.description);
            expectFilledList(project.tech);
        }
    });

    it('links every repository and external page over https', () => {
        for (const project of allProjects) {
            expect(project.repoURL).toMatch(HTTPS_URL);
            for (const link of project.links ?? []) {
                expectFilledText(link.label);
                expect(link.url).toMatch(HTTPS_URL);
            }
        }
    });

    it.each([
        ['package', collapsedPackageProjectCount, packageProjects],
        ['personal', collapsedPersonalProjectCount, personalProjects],
    ])(
        'collapses to a count the %s list can fill',
        (_group, collapsedCount, projects) => {
            expect(Number.isInteger(collapsedCount)).toBe(true);
            expect(collapsedCount).toBeGreaterThan(0);
            expect(collapsedCount).toBeLessThanOrEqual(projects.length);
        }
    );
});

describe('AboutMeArea facets', () => {
    it('uses unique titles and placements', () => {
        expectUnique(facets.map((facet) => facet.title));
        expectUnique(facets.map((facet) => facet.placementClassName));
    });

    it('fills in each facet', () => {
        for (const facet of facets) {
            expectFilledText(facet.title);
            expectFilledText(facet.text);
            expectFilledText(facet.accent);
            expectFilledText(facet.origin);
        }
    });

    it('keeps connector endpoints inside the diagram box', () => {
        for (const facet of facets) {
            for (const coordinate of [facet.line.x, facet.line.y]) {
                expect(coordinate).toBeGreaterThanOrEqual(0);
                expect(coordinate).toBeLessThanOrEqual(100);
            }
        }
    });
});

describe('ContactArea contents', () => {
    it('renders a field for every form value except the message', () => {
        const fieldNames = contactFields.map((field) => field.name);

        expectUnique(fieldNames);
        expect([...fieldNames, 'message'].sort()).toEqual(
            Object.keys(emptyContactValues).sort()
        );
    });

    it('starts every form value empty', () => {
        expect(Object.values(emptyContactValues)).toEqual(
            Object.keys(emptyContactValues).map(() => '')
        );
    });

    it('labels every field', () => {
        for (const field of contactFields) {
            expectFilledText(field.label);
            expectFilledText(field.placeholder);
            expectFilledText(field.autoComplete);
        }
        expectFilledText(messageField.label);
        expectFilledText(messageField.placeholder);
    });
});

/** Whether a /now block has something to show. */
function nowBlockHasContent(block: NowBlockData): boolean {
    if (block.kind === 'tags') {
        return block.tags.length > 0;
    }
    if (block.kind === 'list') {
        return block.items.length > 0;
    }
    return block.text.trim() !== '';
}

describe('/now contents', () => {
    it('has a title, subtitle, update label and quote', () => {
        expectFilledText(nowMeta.title);
        expectFilledText(nowMeta.subtitle);
        expectFilledText(nowMeta.lastUpdated);
        expectFilledText(nowQuote);
    });

    it('uses unique section titles, each with an icon', () => {
        expectUnique(nowSections.map((section) => section.title));
        for (const section of nowSections) {
            expectComponent(section.Icon);
        }
    });

    it('gives every section at least one known, non-empty block', () => {
        for (const section of nowSections) {
            expect(section.blocks.length).toBeGreaterThan(0);
            for (const block of section.blocks) {
                expect(['tags', 'list', 'text']).toContain(block.kind);
                expect(nowBlockHasContent(block)).toBe(true);
            }
        }
    });
});

/** Whether a /uses block has something to show. */
function usesBlockHasContent(block: UsesBlockData): boolean {
    if (block.kind === 'specs') {
        return block.specs.every(
            (spec) => spec.label.trim() !== '' && spec.value.trim() !== ''
        );
    }
    if (block.kind === 'tags') {
        return block.tags.length > 0;
    }
    if (block.kind === 'gear') {
        return block.gear.every(
            (item) => item.name.trim() !== '' && item.description.trim() !== ''
        );
    }
    return block.text.trim() !== '';
}

function usesBlockItemCount(block: UsesBlockData): number {
    if (block.kind === 'specs') {
        return block.specs.length;
    }
    if (block.kind === 'tags') {
        return block.tags.length;
    }
    if (block.kind === 'gear') {
        return block.gear.length;
    }
    return 1;
}

describe('/uses contents', () => {
    it('uses unique section titles, each with an icon', () => {
        expectUnique(usesSections.map((section) => section.title));
        for (const section of usesSections) {
            expectComponent(section.Icon);
        }
    });

    it('gives every section at least one known, non-empty block', () => {
        for (const section of usesSections) {
            expect(section.blocks.length).toBeGreaterThan(0);
            for (const block of section.blocks) {
                expect(['specs', 'tags', 'gear', 'text']).toContain(block.kind);
                expect(usesBlockItemCount(block)).toBeGreaterThan(0);
                expect(usesBlockHasContent(block)).toBe(true);
            }
        }
    });
});

const RESUME_KINDS: ResumeSectionData['kind'][] = [
    'experience',
    'projects',
    'skills',
    'bullets',
    'education',
    'awards',
    'text',
];

/** Checks the body of one resume section for the fields its kind renders. */
function expectResumeSectionFilled(section: ResumeSectionData) {
    if (section.kind === 'text') {
        expectFilledText(section.text);
        return;
    }
    if (section.kind === 'bullets') {
        expectFilledList(section.items);
        return;
    }
    if (section.kind === 'skills') {
        expect(section.groups.length).toBeGreaterThan(0);
        for (const group of section.groups) {
            expectFilledText(group.label);
            expectFilledList(group.values);
        }
        return;
    }
    if (section.kind === 'experience') {
        expect(section.entries.length).toBeGreaterThan(0);
        for (const entry of section.entries) {
            expectFilledText(entry.company);
            expect(entry.positions.length).toBeGreaterThan(0);
            for (const position of entry.positions) {
                expectFilledText(position.role);
                expectFilledText(position.period);
            }
        }
        return;
    }
    if (section.kind === 'projects') {
        expect(section.entries.length).toBeGreaterThan(0);
        for (const entry of section.entries) {
            expectFilledText(entry.name);
            if (entry.url !== undefined) {
                expect(entry.url).toMatch(HTTPS_URL);
            }
        }
        return;
    }
    if (section.kind === 'education') {
        expect(section.entries.length).toBeGreaterThan(0);
        for (const entry of section.entries) {
            expectFilledText(entry.institution);
            expectFilledText(entry.degree);
            expectFilledText(entry.year);
        }
        return;
    }
    expect(section.entries.length).toBeGreaterThan(0);
    for (const entry of section.entries) {
        expectFilledText(entry.title);
        expectFilledText(entry.date);
    }
}

describe('/resume contents', () => {
    it('has a name and location', () => {
        expectFilledText(resumeName);
        expectFilledText(resumeLocation);
    });

    it('links each contact by mailto or https', () => {
        expect(resumeContacts.length).toBeGreaterThan(0);
        for (const contact of resumeContacts) {
            expectFilledText(contact.label);
            expect(contact.href).toMatch(/^(mailto:\S+@\S+|https:\/\/\S+)$/);
        }
    });

    it('uses unique section labels', () => {
        expectUnique(resumeSections.map((section) => section.label));
    });

    it.each(resumeSections)(
        '$label is a known kind with content',
        (section) => {
            expect(RESUME_KINDS).toContain(section.kind);
            expectFilledText(section.label);
            expectResumeSectionFilled(section);
        }
    );
});
