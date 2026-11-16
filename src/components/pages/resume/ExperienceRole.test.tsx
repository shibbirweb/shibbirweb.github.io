import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ExperienceRole from '@/components/pages/resume/ExperienceRole';
import type {
    ExperienceEntry,
    ExperiencePosition,
} from '@/components/pages/resume/types';

const entry: ExperienceEntry = {
    company: 'Acme',
    companyURL: 'https://acme.example',
    location: 'Dhaka',
    positions: [],
};

const position: ExperiencePosition = {
    role: 'Senior Engineer',
    promotedFrom: ['Junior Engineer', 'Engineer'],
    period: '2022 - Present',
    highlights: ['Led the migration'],
    tech: ['Laravel', 'Vue'],
};

describe('ExperienceRole', () => {
    it('heads the role as "Role, Company" with its period', () => {
        render(
            <ExperienceRole
                entry={entry}
                position={position}
            />
        );

        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
            'Senior Engineer, Acme'
        );
        expect(screen.getByText('2022 - Present')).toBeInTheDocument();
    });

    it('links the company when it has a URL', () => {
        render(
            <ExperienceRole
                entry={entry}
                position={position}
            />
        );

        const link = screen.getByRole('link', { name: 'Acme' });
        expect(link).toHaveAttribute('href', 'https://acme.example');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('shows the company as plain text without a URL', () => {
        render(
            <ExperienceRole
                entry={{ ...entry, companyURL: undefined }}
                position={position}
            />
        );

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
            'Senior Engineer, Acme'
        );
    });

    it('shows the location and promotion path under the heading', () => {
        render(
            <ExperienceRole
                entry={entry}
                position={position}
            />
        );

        expect(
            screen.getByText('Dhaka · Promoted from Junior Engineer, Engineer')
        ).toBeInTheDocument();
    });

    it('omits the secondary line when there is nothing for it', () => {
        const { container } = render(
            <ExperienceRole
                entry={{ ...entry, location: undefined }}
                position={{ role: 'Intern', period: '2020' }}
            />
        );

        expect(screen.queryByText(/Promoted from/)).not.toBeInTheDocument();
        // Only the period remains as secondary text.
        expect(container.querySelectorAll('span.font-mono')).toHaveLength(1);
    });

    it('shows highlights and technology chips only where present', () => {
        const { rerender } = render(
            <ExperienceRole
                entry={entry}
                position={position}
            />
        );

        expect(screen.getByText('Led the migration')).toBeInTheDocument();
        expect(screen.getByText('Technologies:')).toBeInTheDocument();
        expect(screen.getByText('Laravel')).toBeInTheDocument();

        rerender(
            <ExperienceRole
                entry={entry}
                position={{ role: 'Intern', period: '2020' }}
            />
        );

        expect(screen.queryByRole('list')).not.toBeInTheDocument();
        expect(screen.queryByText('Technologies:')).not.toBeInTheDocument();
    });
});
