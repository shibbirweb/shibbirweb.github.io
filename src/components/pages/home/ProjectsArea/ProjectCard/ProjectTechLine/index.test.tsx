import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProjectTechLine from '@/components/pages/home/ProjectsArea/ProjectCard/ProjectTechLine';

const tech = ['Rust', 'Tauri', 'Svelte'];

function getTags() {
    return within(
        screen.getByRole('list', { name: 'Tech stack' })
    ).getAllByRole('listitem');
}

describe('ProjectTechLine', () => {
    it('is a list named for assistive tech', () => {
        render(<ProjectTechLine tech={tech} />);

        expect(
            screen.getByRole('list', { name: 'Tech stack' })
        ).toBeInTheDocument();
    });

    it('renders one tag per technology, in order', () => {
        render(<ProjectTechLine tech={tech} />);

        expect(getTags().map((tag) => tag.textContent)).toEqual(tech);
    });

    it('gives each tag its position so the hover tint can sweep across', () => {
        render(<ProjectTechLine tech={tech} />);

        expect(
            getTags().map((tag) => tag.style.getPropertyValue('--token-index'))
        ).toEqual(['0', '1', '2']);
    });

    it('puts the label on an inner face so the glow is not clipped', () => {
        render(<ProjectTechLine tech={tech} />);

        for (const tag of getTags()) {
            const face = tag.firstElementChild;
            expect(face?.tagName).toBe('SPAN');
            expect(face).toHaveTextContent(tag.textContent ?? '');
        }
    });

    it('renders an empty list when there is no tech', () => {
        render(<ProjectTechLine tech={[]} />);

        expect(
            screen.getByRole('list', { name: 'Tech stack' })
        ).toBeEmptyDOMElement();
    });
});
