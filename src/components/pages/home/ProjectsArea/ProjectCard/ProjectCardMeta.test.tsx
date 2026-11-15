import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProjectCardMeta from '@/components/pages/home/ProjectsArea/ProjectCard/ProjectCardMeta';

function renderMeta(number: number) {
    return render(
        <ProjectCardMeta
            number={number}
            category="MCP Server"
        />
    );
}

describe('ProjectCardMeta', () => {
    it('shows the category', () => {
        renderMeta(1);

        expect(screen.getByText('MCP Server')).toBeInTheDocument();
    });

    it('zero-pads single digit numbers', () => {
        renderMeta(3);

        expect(screen.getByText('03')).toBeInTheDocument();
    });

    it('leaves two digit numbers as they are', () => {
        renderMeta(12);

        expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('hides the decorative number and separator from assistive tech', () => {
        renderMeta(3);

        expect(screen.getByText('03')).toHaveAttribute('aria-hidden', 'true');
        expect(screen.getByText('/')).toHaveAttribute('aria-hidden', 'true');
        expect(screen.getByText('MCP Server')).not.toHaveAttribute(
            'aria-hidden'
        );
    });
});
