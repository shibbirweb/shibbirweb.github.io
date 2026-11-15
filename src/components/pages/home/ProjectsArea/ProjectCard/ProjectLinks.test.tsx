import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProjectLinks from '@/components/pages/home/ProjectsArea/ProjectCard/ProjectLinks';
import type { Project } from '@/components/pages/home/ProjectsArea/contents';

const project: Project = {
    name: 'Nibtree',
    category: 'Desktop Git Client',
    description: 'A desktop Git client.',
    tech: ['Rust'],
    repoURL: 'https://github.com/shibbirweb/nibtree',
    links: [
        {
            url: 'https://github.com/shibbirweb/nibtree/releases',
            label: 'Releases',
        },
        {
            url: 'https://www.npmjs.com/package/nibtree',
            label: 'npm',
        },
    ],
};

describe('ProjectLinks', () => {
    it('leads with the source code, then every extra link in order', () => {
        render(<ProjectLinks project={project} />);

        expect(
            screen.getAllByRole('link').map((link) => link.textContent)
        ).toEqual(['Code', 'Releases', 'npm']);
    });

    it('names each link after the project', () => {
        render(<ProjectLinks project={project} />);

        expect(
            screen.getByRole('link', { name: 'Nibtree source on GitHub' })
        ).toHaveAttribute('href', project.repoURL);
        expect(
            screen.getByRole('link', { name: 'Nibtree, npm' })
        ).toHaveAttribute('href', 'https://www.npmjs.com/package/nibtree');
    });

    it('shows only the code link when the project has no extra links', () => {
        render(<ProjectLinks project={{ ...project, links: undefined }} />);

        expect(screen.getAllByRole('link')).toHaveLength(1);
    });
});
