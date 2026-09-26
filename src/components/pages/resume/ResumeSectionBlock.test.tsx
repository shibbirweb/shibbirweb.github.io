import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ResumeSectionBlock from '@/components/pages/resume/ResumeSectionBlock';

describe('ResumeSectionBlock', () => {
    it('renders an experience section with roles, dates, and highlights', () => {
        render(
            <ResumeSectionBlock
                section={{
                    kind: 'experience',
                    label: 'Experience',
                    entries: [
                        {
                            company: 'Acme',
                            location: 'Remote',
                            positions: [
                                {
                                    role: 'Engineer',
                                    period: '2024 - Present',
                                    highlights: ['Shipped the thing'],
                                    tech: ['Laravel'],
                                },
                            ],
                        },
                    ],
                }}
            />
        );

        expect(
            screen.getByRole('heading', { level: 3, name: 'Acme' })
        ).toBeInTheDocument();
        expect(screen.getByText('Remote')).toBeInTheDocument();
        expect(screen.getByText('Engineer')).toBeInTheDocument();
        expect(screen.getByText('2024 - Present')).toBeInTheDocument();
        expect(screen.getByText('Shipped the thing')).toBeInTheDocument();
        expect(screen.getByText('Technologies:')).toBeInTheDocument();
    });

    it('renders a projects section with the tagline and company', () => {
        render(
            <ResumeSectionBlock
                section={{
                    kind: 'projects',
                    label: 'Projects',
                    entries: [
                        {
                            name: 'Portal',
                            tagline: 'Patient intake',
                            company: 'Acme',
                            url: 'https://example.com/portal',
                        },
                    ],
                }}
            />
        );

        expect(screen.getByRole('link', { name: 'Portal' })).toHaveAttribute(
            'href',
            'https://example.com/portal'
        );
        expect(screen.getByText('Patient intake')).toBeInTheDocument();
        expect(screen.getByText('Acme')).toBeInTheDocument();
    });

    it('renders a skills section as label and comma-joined values', () => {
        const { container } = render(
            <ResumeSectionBlock
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

    it('renders a bullets section as a list', () => {
        render(
            <ResumeSectionBlock
                section={{
                    kind: 'bullets',
                    label: 'Focus',
                    items: ['Reliability', 'Mentoring'],
                }}
            />
        );

        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getByText('Mentoring')).toBeInTheDocument();
    });

    it('renders an education section with the degree and year', () => {
        render(
            <ResumeSectionBlock
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
            screen.getByRole('heading', { name: 'State University' })
        ).toBeInTheDocument();
        expect(screen.getByText('BSc in CSE')).toBeInTheDocument();
        expect(screen.getByText('2018')).toBeInTheDocument();
    });

    it('links the institution when it has a URL', () => {
        render(
            <ResumeSectionBlock
                section={{
                    kind: 'education',
                    label: 'Education',
                    entries: [
                        {
                            institution: 'State University',
                            institutionURL: 'https://example.edu',
                            degree: 'BSc',
                            year: '2018',
                        },
                    ],
                }}
            />
        );

        expect(
            screen.getByRole('link', { name: 'State University' })
        ).toHaveAttribute('href', 'https://example.edu');
    });

    it('renders an awards section with the issuer', () => {
        render(
            <ResumeSectionBlock
                section={{
                    kind: 'awards',
                    label: 'Awards',
                    entries: [
                        {
                            title: 'Star Performer',
                            issuer: 'Acme',
                            date: 'Jul 2025',
                        },
                    ],
                }}
            />
        );

        expect(
            screen.getByRole('heading', { name: 'Star Performer' })
        ).toBeInTheDocument();
        expect(screen.getByText('Acme')).toBeInTheDocument();
        expect(screen.getByText('Jul 2025')).toBeInTheDocument();
    });

    it('renders a text section as a paragraph', () => {
        render(
            <ResumeSectionBlock
                section={{
                    kind: 'text',
                    label: 'Languages',
                    text: 'English, Bengali',
                }}
            />
        );

        expect(screen.getByText('English, Bengali').tagName).toBe('P');
    });
});
