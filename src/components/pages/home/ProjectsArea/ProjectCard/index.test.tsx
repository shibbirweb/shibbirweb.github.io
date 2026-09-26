import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProjectCard from '@/components/pages/home/ProjectsArea/ProjectCard';
import type { Project } from '@/components/pages/home/ProjectsArea/contents';

const project: Project = {
    name: 'Caret Height',
    category: 'VS Code Extension',
    description: 'Makes the caret easier to track.',
    tech: ['TypeScript', 'VS Code API'],
    repoURL: 'https://github.com/shibbirweb/caret-height',
    links: [
        {
            url: 'https://marketplace.visualstudio.com/items?itemName=caret',
            label: 'Marketplace',
        },
    ],
};

function renderCard(cardProject: Project = project, index = 0) {
    return render(
        <ul>
            <ProjectCard
                project={cardProject}
                index={index}
            />
        </ul>
    );
}

function getCard() {
    return screen
        .getByRole('heading', { name: project.name })
        .closest('li') as HTMLLIElement;
}

describe('ProjectCard', () => {
    it('shows the category, name, and description', () => {
        renderCard();

        expect(
            screen.getByRole('heading', { level: 4, name: 'Caret Height' })
        ).toBeInTheDocument();
        expect(screen.getByText('VS Code Extension')).toBeInTheDocument();
        expect(
            screen.getByText('Makes the caret easier to track.')
        ).toBeInTheDocument();
    });

    it('lists each technology as a tag', () => {
        renderCard();

        const tags = within(getCard())
            .getAllByRole('listitem')
            .map((tag) => tag.textContent);
        expect(tags).toEqual(['TypeScript', 'VS Code API']);
    });

    it('links the source code with a descriptive name', () => {
        renderCard();

        expect(
            screen.getByRole('link', { name: 'Caret Height source on GitHub' })
        ).toHaveAttribute('href', project.repoURL);
    });

    it('adds a link for every extra destination', () => {
        renderCard();

        expect(
            screen.getByRole('link', { name: 'Caret Height, Marketplace' })
        ).toHaveAttribute(
            'href',
            'https://marketplace.visualstudio.com/items?itemName=caret'
        );
    });

    it('shows only the code link when there are no extra links', () => {
        renderCard({ ...project, links: undefined });

        expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('marks itself as a spotlight surface', () => {
        renderCard();

        expect(getCard()).toHaveAttribute('data-spotlight-surface', 'true');
    });

    it('derives a distinct glow hue from its position', () => {
        const { unmount } = renderCard(project, 0);
        const firstHue = getCard().style.getPropertyValue('--glow-a');
        unmount();

        renderCard(project, 1);
        const secondHue = getCard().style.getPropertyValue('--glow-a');

        expect(firstHue).toBe('oklch(0.72 0.16 0)');
        expect(secondHue).not.toBe(firstHue);
    });
});
