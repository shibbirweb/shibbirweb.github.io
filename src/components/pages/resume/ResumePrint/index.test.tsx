import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ResumePrint from '@/components/pages/resume/ResumePrint';
import type { ResumeSectionData } from '@/components/pages/resume/types';

const sections: ResumeSectionData[] = [
    {
        kind: 'text',
        label: 'Summary',
        paragraphs: ['Builds web products.'],
    },
    {
        kind: 'bullets',
        label: 'AI Experience',
        items: ['Built an MCP server'],
    },
];

function renderResume(location?: string, languages?: string) {
    return render(
        <ResumePrint
            name="Jane Doe"
            headline="Senior Engineer · Laravel"
            location={location}
            languages={languages}
            contacts={[
                { label: 'jane@example.com', href: 'mailto:jane@example.com' },
                { label: 'example.com', href: 'https://example.com' },
            ]}
            sections={sections}
        />
    );
}

describe('ResumePrint', () => {
    it("adds no h1, leaving the page with the screen card's one", () => {
        const { container } = renderResume();

        expect(container.querySelector('h1')).toBeNull();
    });

    it('is hidden on screen and shown only in print', () => {
        renderResume();

        expect(screen.getByTestId('resume-print')).toHaveClass(
            'hidden',
            'print:block'
        );
    });

    it('puts the name, headline and location in the header', () => {
        const { container } = renderResume('Dhaka, Bangladesh');
        const header = within(container.querySelector('header')!);

        expect(header.getByText('Jane Doe')).toBeInTheDocument();
        expect(
            header.getByText('Senior Engineer · Laravel')
        ).toBeInTheDocument();
        expect(header.getByText('Dhaka, Bangladesh')).toBeInTheDocument();
    });

    it('omits the location and languages lines when there are none', () => {
        renderResume();

        expect(screen.queryByText('Dhaka, Bangladesh')).not.toBeInTheDocument();
        expect(screen.queryByText(/^Languages:/)).not.toBeInTheDocument();
    });

    it('lists the spoken languages in the header', () => {
        const { container } = renderResume(undefined, 'Bengali, English');

        expect(
            within(container.querySelector('header')!).getByText(
                'Languages: Bengali, English'
            )
        ).toBeInTheDocument();
    });

    it('links every contact, opening only web links in a new tab', () => {
        renderResume();

        const email = screen.getByRole('link', {
            name: 'jane@example.com',
        });
        const site = screen.getByRole('link', {
            name: 'example.com',
        });
        expect(email).toHaveAttribute('href', 'mailto:jane@example.com');
        expect(email).not.toHaveAttribute('target');
        expect(site).toHaveAttribute('target', '_blank');
    });

    it('renders every section in order under its heading', () => {
        renderResume();

        const headings = screen
            .getAllByRole('heading', { level: 2 })
            .map((heading) => heading.textContent);
        expect(headings).toEqual(['Summary', 'AI Experience']);
        expect(screen.getByText('Builds web products.')).toBeInTheDocument();
        expect(screen.getByText('Built an MCP server')).toBeInTheDocument();
    });
});
