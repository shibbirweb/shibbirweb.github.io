import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SectionHeading from '@/components/pages/common/SectionHeading';

describe('SectionHeading', () => {
    it('renders an h2 by default', () => {
        render(<SectionHeading>About me</SectionHeading>);

        expect(
            screen.getByRole('heading', { level: 2, name: 'About me' })
        ).toBeInTheDocument();
    });

    it('renders the requested heading level', () => {
        render(<SectionHeading as="h1">Now</SectionHeading>);

        expect(
            screen.getByRole('heading', { level: 1, name: 'Now' })
        ).toBeInTheDocument();
    });

    it('merges extra classes and forwards other attributes', () => {
        render(
            <SectionHeading
                id="skills-heading"
                className="text-center"
            >
                Skills
            </SectionHeading>
        );

        const heading = screen.getByRole('heading', { name: 'Skills' });
        expect(heading).toHaveAttribute('id', 'skills-heading');
        expect(heading).toHaveClass('text-3xl', 'text-center');
    });
});
