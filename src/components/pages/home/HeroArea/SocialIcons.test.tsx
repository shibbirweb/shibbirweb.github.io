import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SocialIcons from '@/components/pages/home/HeroArea/SocialIcons';
import { socialLinks } from '@/components/pages/home/HeroArea/contents';

describe('SocialIcons', () => {
    it('renders one link per social profile', () => {
        render(<SocialIcons />);

        expect(screen.getAllByRole('link')).toHaveLength(socialLinks.length);
    });

    it('gives every link an accessible name and the matching href', () => {
        render(<SocialIcons />);

        for (const { name, href } of socialLinks) {
            expect(screen.getByRole('link', { name })).toHaveAttribute(
                'href',
                href
            );
        }
    });

    it('opens every profile in a new tab without leaking the opener', () => {
        render(<SocialIcons />);

        for (const link of screen.getAllByRole('link')) {
            expect(link).toHaveAttribute('target', '_blank');
            expect(link.getAttribute('rel')).toContain('noopener');
            expect(link.getAttribute('rel')).toContain('noreferrer');
        }
    });

    it('keeps the icons decorative', () => {
        render(<SocialIcons />);

        for (const link of screen.getAllByRole('link')) {
            expect(link.querySelector('svg')).toHaveAttribute(
                'aria-hidden',
                'true'
            );
        }
    });
});
