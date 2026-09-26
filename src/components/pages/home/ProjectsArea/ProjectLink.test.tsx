import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GithubIcon from '@/components/icons/github';
import ProjectLink from '@/components/pages/home/ProjectsArea/ProjectLink';

describe('ProjectLink', () => {
    function renderLink() {
        return render(
            <ProjectLink
                href="https://github.com/shibbirweb/example"
                label="Code"
                ariaLabel="Example source on GitHub"
                Icon={GithubIcon}
            />
        );
    }

    it('is named by its descriptive aria-label', () => {
        renderLink();

        const link = screen.getByRole('link', {
            name: 'Example source on GitHub',
        });
        expect(link).toHaveAttribute(
            'href',
            'https://github.com/shibbirweb/example'
        );
        expect(link).toHaveTextContent('Code');
    });

    it('opens in a new tab safely', () => {
        renderLink();

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('hides the icon from assistive tech', () => {
        renderLink();

        expect(screen.getByRole('link').querySelector('svg')).toHaveAttribute(
            'aria-hidden',
            'true'
        );
    });
});
