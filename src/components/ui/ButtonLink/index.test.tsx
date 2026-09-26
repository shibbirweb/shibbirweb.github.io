import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ButtonLink from '@/components/ui/ButtonLink';

describe('ButtonLink', () => {
    it('renders a link with the button styling', () => {
        render(<ButtonLink href="/">Back home</ButtonLink>);

        const link = screen.getByRole('link', { name: 'Back home' });
        expect(link).toHaveAttribute('href', '/');
        expect(link).toHaveClass('focus-ring', 'bg-foreground');
    });

    it('applies the requested variant and extra classes', () => {
        render(
            <ButtonLink
                href="/articles"
                variant="outline"
                className="mt-4"
            >
                All articles
            </ButtonLink>
        );

        const link = screen.getByRole('link', { name: 'All articles' });
        expect(link).toHaveClass('border', 'mt-4');
        expect(link).not.toHaveClass('bg-foreground');
    });

    it('forwards other link props', () => {
        render(
            <ButtonLink
                href="/resume"
                aria-label="Open the resume"
                data-testid="resume-link"
            >
                Resume
            </ButtonLink>
        );

        expect(
            screen.getByRole('link', { name: 'Open the resume' })
        ).toHaveAttribute('data-testid', 'resume-link');
    });
});
