import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ResumeContactHeader from '@/components/pages/resume/ResumeContactHeader';

const contacts = [{ label: 'example.com', href: 'https://example.com' }];

describe('ResumeContactHeader', () => {
    it('shows the name, headline, contacts, location and languages', () => {
        render(
            <ResumeContactHeader
                name="Jane Doe"
                headline="Senior Engineer · Laravel"
                contacts={contacts}
                location="Dhaka"
                languages="Bengali, English"
            />
        );

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            'Jane Doe'
        );
        expect(
            screen.getByText('Senior Engineer · Laravel')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'example.com' })
        ).toBeInTheDocument();
        expect(screen.getByText('Dhaka')).toBeInTheDocument();
        expect(
            screen.getByText('Languages: Bengali, English')
        ).toBeInTheDocument();
    });

    it('omits the headline, location and languages when absent', () => {
        const { container } = render(
            <ResumeContactHeader
                name="Jane Doe"
                contacts={contacts}
            />
        );

        expect(screen.queryByText(/^Languages:/)).not.toBeInTheDocument();
        // Only the contact row is left.
        expect(container.querySelectorAll('p')).toHaveLength(1);
    });
});
