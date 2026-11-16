import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PrintSectionBlock from '@/components/pages/resume/ResumePrint/PrintSectionBlock';

describe('PrintSectionBlock', () => {
    it('prints each role as "Role, Company" with its dates and details', () => {
        render(
            <PrintSectionBlock
                section={{
                    kind: 'experience',
                    label: 'Experience',
                    entries: [
                        {
                            company: 'Acme',
                            companyURL: 'https://acme.example',
                            location: 'Remote',
                            positions: [
                                {
                                    role: 'Lead Engineer',
                                    promotedFrom: ['Engineer'],
                                    period: '2024 - Present',
                                    highlights: ['Shipped the thing'],
                                    tech: ['Laravel', 'Vue'],
                                },
                            ],
                        },
                    ],
                }}
            />
        );

        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
            'Lead Engineer, Acme'
        );
        expect(screen.getByRole('link', { name: 'Acme' })).toHaveAttribute(
            'href',
            'https://acme.example'
        );
        expect(screen.getByText('2024 - Present')).toBeInTheDocument();
        expect(
            screen.getByText('Remote · Promoted from Engineer')
        ).toBeInTheDocument();
        expect(screen.getByText('Shipped the thing')).toBeInTheDocument();
        expect(screen.getByText('Stack:').parentElement).toHaveTextContent(
            'Stack: Laravel, Vue'
        );
    });

    it('prints one block per role when a company has several', () => {
        render(
            <PrintSectionBlock
                section={{
                    kind: 'experience',
                    label: 'Experience',
                    entries: [
                        {
                            company: 'Acme',
                            positions: [
                                { role: 'Lead', period: '2024' },
                                { role: 'Engineer', period: '2022' },
                            ],
                        },
                    ],
                }}
            />
        );

        expect(
            screen
                .getAllByRole('heading', { level: 3 })
                .map((heading) => heading.textContent)
        ).toEqual(['Lead, Acme', 'Engineer, Acme']);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.queryByText('Stack:')).not.toBeInTheDocument();
    });

    it('prints detailed projects with tagline, company and highlights', () => {
        render(
            <PrintSectionBlock
                section={{
                    kind: 'projects',
                    label: 'Projects',
                    entries: [
                        {
                            name: 'Portal',
                            tagline: 'Patient intake',
                            company: 'Acme',
                            url: 'https://example.com/portal',
                            highlights: ['Cut intake time'],
                        },
                    ],
                }}
            />
        );

        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
            'Portal, Patient intake'
        );
        expect(screen.getByRole('link', { name: 'Portal' })).toHaveAttribute(
            'href',
            'https://example.com/portal'
        );
        expect(screen.getByText('Acme')).toBeInTheDocument();
        expect(screen.getByRole('listitem')).toHaveTextContent(
            'Cut intake time'
        );
    });

    it('prints compact projects as one bullet each', () => {
        render(
            <PrintSectionBlock
                section={{
                    kind: 'projects',
                    label: 'Open Source',
                    layout: 'compact',
                    entries: [
                        {
                            name: 'Paginate',
                            tech: ['Vue.js', 'JavaScript'],
                            highlights: ['Pagination for Laravel.'],
                            url: 'https://example.com/paginate',
                        },
                        { name: 'Plain' },
                    ],
                }}
            />
        );

        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveTextContent(
            'Paginate (Vue.js, JavaScript): Pagination for Laravel.'
        );
        expect(items[1]).toHaveTextContent(/^Plain$/);
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('prints skills as label and comma-joined value pairs', () => {
        const { container } = render(
            <PrintSectionBlock
                section={{
                    kind: 'skills',
                    label: 'Skills',
                    groups: [{ label: 'Backend', values: ['PHP', 'Node.js'] }],
                }}
            />
        );

        expect(container.querySelector('dt')).toHaveTextContent('Backend');
        expect(container.querySelector('dd')).toHaveTextContent('PHP, Node.js');
    });

    it('prints a bullets section as a list', () => {
        render(
            <PrintSectionBlock
                section={{
                    kind: 'bullets',
                    label: 'Focus',
                    items: ['Reliability', 'Mentoring'],
                }}
            />
        );

        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('prints each qualification on one line', () => {
        render(
            <PrintSectionBlock
                section={{
                    kind: 'education',
                    label: 'Education',
                    entries: [
                        {
                            institution: 'State University',
                            degree: 'BSc in CSE',
                            year: '2018',
                        },
                    ],
                }}
            />
        );

        expect(
            screen.getByText('BSc in CSE, State University, 2018')
        ).toBeInTheDocument();
    });

    it('prints awards with the issuer and date', () => {
        render(
            <PrintSectionBlock
                section={{
                    kind: 'awards',
                    label: 'Awards',
                    entries: [
                        { title: 'Star', issuer: 'Acme', date: 'Jul 2025' },
                        { title: 'Solo', date: '2020' },
                    ],
                }}
            />
        );

        expect(screen.getByText('Star').parentElement).toHaveTextContent(
            'Star, Acme'
        );
        expect(screen.getByText('Solo').parentElement).toHaveTextContent(
            /^Solo$/
        );
        expect(screen.getByText('Jul 2025')).toBeInTheDocument();
    });

    it('prints a text section as one paragraph per entry', () => {
        render(
            <PrintSectionBlock
                section={{
                    kind: 'text',
                    label: 'Summary',
                    paragraphs: ['First paragraph.', 'Second paragraph.'],
                }}
            />
        );

        expect(screen.getByText('First paragraph.').tagName).toBe('P');
        expect(screen.getByText('Second paragraph.').tagName).toBe('P');
    });
});
