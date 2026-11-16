import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ResumeBridge from '@/components/pages/home/ProjectsArea/ResumeBridge';

describe('ResumeBridge', () => {
    it('points from the projects to the resume', () => {
        render(<ResumeBridge />);

        expect(
            screen.getByText(
                'My professional, client-facing work lives on the resume.'
            )
        ).toBeInTheDocument();
    });

    it('links to the resume as the outlined rounded button', () => {
        render(<ResumeBridge />);

        const link = screen.getByRole('link', { name: 'View resume' });
        expect(link).toHaveAttribute('href', '/resume');
        expect(link).toHaveClass('border', 'rounded-full');
    });
});
