import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProjectGroupHeading from '@/components/pages/home/ProjectsArea/ProjectGroupHeading';

// The count is split across elements ("05" plus a screen reader " projects"),
// so match the innermost element whose full text is the spoken count.
function getCount(spokenCount: string) {
    return screen.getByText(
        (_, element) =>
            element?.textContent === spokenCount &&
            ![...element.children].some(
                (child) => child.textContent === spokenCount
            )
    );
}

describe('ProjectGroupHeading', () => {
    it('renders the title as a level 3 heading', () => {
        render(
            <ProjectGroupHeading
                title="Hobby Projects"
                count={5}
            />
        );

        expect(
            screen.getByRole('heading', { level: 3, name: 'Hobby Projects' })
        ).toBeInTheDocument();
    });

    it('shows the project count zero-padded and spelled out for screen readers', () => {
        render(
            <ProjectGroupHeading
                title="Hobby Projects"
                count={5}
            />
        );

        const count = getCount('05 projects');
        expect(count.lastElementChild).toHaveTextContent('projects');
        expect(count.lastElementChild).toHaveClass('sr-only');
    });

    it('leaves two digit counts as they are', () => {
        render(
            <ProjectGroupHeading
                title="Packages & Plugins"
                count={12}
            />
        );

        expect(getCount('12 projects')).toBeInTheDocument();
    });
});
