import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ProjectGroup from '@/components/pages/home/ProjectsArea/ProjectGroup';
import type { Project } from '@/components/pages/home/ProjectsArea/contents';

function makeProject(name: string): Project {
    return {
        name,
        category: 'Personal Project',
        description: `${name} description.`,
        tech: ['TypeScript'],
        repoURL: `https://github.com/shibbirweb/${name.toLowerCase()}`,
    };
}

const projects = ['Alpha', 'Bravo', 'Charlie'].map(makeProject);

function renderGroup(collapsedCount: number, indexOffset?: number) {
    render(
        <ProjectGroup
            title="Personal Projects"
            projects={projects}
            collapsedCount={collapsedCount}
            revealRegionId="more-personal-projects"
            indexOffset={indexOffset}
        />
    );
}

function getCardHeading(name: string) {
    return screen.getByRole('heading', { name, hidden: true });
}

function glowOf(name: string) {
    return getCardHeading(name)
        .closest('li')
        ?.style.getPropertyValue('--glow-a');
}

// Mirrors the golden-angle hue ProjectCard derives from its index.
function expectedGlow(index: number) {
    return `oklch(0.72 0.16 ${(index * 137.508) % 360})`;
}

describe('ProjectGroup', () => {
    it('shows its title', () => {
        renderGroup(2);

        expect(
            screen.getByRole('heading', { name: 'Personal Projects' })
        ).toBeVisible();
    });

    it('shows the first cards and holds the rest behind Show more', () => {
        renderGroup(2);

        expect(getCardHeading('Alpha')).toBeVisible();
        expect(getCardHeading('Bravo')).toBeVisible();
        expect(getCardHeading('Charlie')).not.toBeVisible();
        expect(
            screen.getByRole('button', { name: 'Show more' })
        ).toHaveAttribute('aria-controls', 'more-personal-projects');
    });

    it('reveals the held back cards on Show more', async () => {
        const user = userEvent.setup();
        renderGroup(2);

        await user.click(screen.getByRole('button', { name: 'Show more' }));

        expect(getCardHeading('Charlie')).toBeVisible();
    });

    it('numbers the glow from its offset and carries on behind Show more', () => {
        renderGroup(2, 6);

        expect(glowOf('Alpha')).toBe(expectedGlow(6));
        expect(glowOf('Bravo')).toBe(expectedGlow(7));
        expect(glowOf('Charlie')).toBe(expectedGlow(8));
    });

    it('leaves the toggle out when every card fits', () => {
        renderGroup(projects.length);

        expect(getCardHeading('Charlie')).toBeVisible();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
