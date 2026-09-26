import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ExperienceItem from '@/components/pages/resume/ExperienceItem';
import type { ExperienceEntry } from '@/components/pages/resume/types';

const entry: ExperienceEntry = {
    company: 'Acme',
    companyURL: 'https://acme.example',
    location: 'Dhaka',
    positions: [
        {
            role: 'Senior Engineer',
            promotedFrom: ['Junior Engineer', 'Engineer'],
            period: '2022 - Present',
            highlights: ['Led the migration'],
            tech: ['Laravel', 'Vue'],
        },
        {
            role: 'Intern',
            period: '2020',
        },
    ],
};

describe('ExperienceItem', () => {
    it('links the company name when it has a URL', () => {
        render(<ExperienceItem entry={entry} />);

        const link = screen.getByRole('link', { name: 'Acme' });
        expect(link).toHaveAttribute('href', 'https://acme.example');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('shows the company as plain text without a URL', () => {
        render(<ExperienceItem entry={{ ...entry, companyURL: undefined }} />);

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(
            screen.getByRole('heading', { level: 3, name: 'Acme' })
        ).toBeInTheDocument();
    });

    it('shows the promotion path with arrows on screen', () => {
        render(<ExperienceItem entry={entry} />);

        expect(
            screen.getByText('Junior Engineer → Engineer')
        ).toBeInTheDocument();
    });

    it('keeps a comma-separated promotion path for print', () => {
        render(<ExperienceItem entry={entry} />);

        expect(screen.getByText('Junior Engineer, Engineer')).toHaveClass(
            'hidden',
            'print:inline'
        );
    });

    it('omits the promotion note when there is none', () => {
        render(
            <ExperienceItem
                entry={{
                    ...entry,
                    positions: [
                        { role: 'Engineer', period: '2021', promotedFrom: [] },
                    ],
                }}
            />
        );

        expect(screen.queryByText(/promoted from/)).not.toBeInTheDocument();
    });

    it('lists every position with its period', () => {
        render(<ExperienceItem entry={entry} />);

        expect(screen.getByText('2022 - Present')).toBeInTheDocument();
        expect(screen.getByText('Intern')).toBeInTheDocument();
        expect(screen.getByText('2020')).toBeInTheDocument();
    });

    it('shows highlights and the technology line only where present', () => {
        render(<ExperienceItem entry={entry} />);

        expect(screen.getByText('Led the migration')).toBeInTheDocument();
        expect(screen.getAllByText('Technologies:')).toHaveLength(1);
        expect(screen.getByText('Laravel, Vue')).toBeInTheDocument();
    });

    it('omits the location when absent', () => {
        render(<ExperienceItem entry={{ ...entry, location: undefined }} />);

        expect(screen.queryByText('Dhaka')).not.toBeInTheDocument();
    });
});
