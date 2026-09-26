import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import MorePackageProjects from '@/components/pages/home/ProjectsArea/MorePackageProjects';

function renderReveal() {
    return render(
        <MorePackageProjects>
            <p>Hidden project</p>
        </MorePackageProjects>
    );
}

describe('MorePackageProjects', () => {
    it('starts collapsed with the extra cards hidden but still in the DOM', () => {
        renderReveal();

        const hiddenProject = screen.getByText('Hidden project');
        expect(hiddenProject).toBeInTheDocument();
        expect(hiddenProject).not.toBeVisible();
    });

    it('offers Show more wired to the hidden region', () => {
        renderReveal();

        const toggle = screen.getByRole('button', { name: 'Show more' });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        const regionId = toggle.getAttribute('aria-controls') ?? '';
        expect(document.getElementById(regionId)).toContainElement(
            screen.getByText('Hidden project')
        );
    });

    it('reveals the cards and switches to Show less', async () => {
        const user = userEvent.setup();
        renderReveal();

        await user.click(screen.getByRole('button', { name: 'Show more' }));

        expect(screen.getByText('Hidden project')).toBeVisible();
        expect(
            screen.getByRole('button', { name: 'Show less' })
        ).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses again on a second click', async () => {
        const user = userEvent.setup();
        renderReveal();

        await user.click(screen.getByRole('button', { name: 'Show more' }));
        await user.click(screen.getByRole('button', { name: 'Show less' }));

        expect(screen.getByText('Hidden project')).not.toBeVisible();
        expect(
            screen.getByRole('button', { name: 'Show more' })
        ).toHaveAttribute('aria-expanded', 'false');
    });
});
