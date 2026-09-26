import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ExternalLink from '@/components/pages/resume/ExternalLink';

describe('ExternalLink', () => {
    it('opens http links in a new tab with a safe rel', () => {
        render(
            <ExternalLink href="https://github.com/shibbirweb">
                GitHub
            </ExternalLink>
        );

        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('leaves mailto links in their own handler', () => {
        render(
            <ExternalLink href="mailto:hello@example.com">Email</ExternalLink>
        );

        const link = screen.getByRole('link', { name: 'Email' });
        expect(link).toHaveAttribute('href', 'mailto:hello@example.com');
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
    });

    it('leaves tel links in their own handler', () => {
        render(<ExternalLink href="tel:+15550100">Call</ExternalLink>);

        expect(screen.getByRole('link', { name: 'Call' })).not.toHaveAttribute(
            'target'
        );
    });

    it('applies the caller class', () => {
        render(
            <ExternalLink
                href="https://shibbir.me"
                className="hover:underline"
            >
                Site
            </ExternalLink>
        );

        expect(screen.getByRole('link', { name: 'Site' })).toHaveClass(
            'hover:underline'
        );
    });
});
