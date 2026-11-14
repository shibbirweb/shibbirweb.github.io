import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AiShowcase from '@/components/pages/home/SkillsArea/AiShowcase';
import {
    aiShowcaseBadge,
    aiShowcaseTitle,
    aiToolkit,
    aiToolkitTitle,
    featuredAiSkills,
} from '@/components/pages/home/SkillsArea/contents';

describe('AiShowcase', () => {
    it('titles the panel and marks it as the core focus', () => {
        render(<AiShowcase />);

        expect(
            screen.getByRole('heading', { level: 3, name: aiShowcaseTitle })
        ).toBeVisible();
        expect(screen.getByText(aiShowcaseBadge)).toBeVisible();
    });

    it('leads with a card per featured AI skill, in order', () => {
        render(<AiShowcase />);

        expect(
            screen
                .getAllByRole('heading', { level: 4 })
                .map((heading) => heading.textContent)
                .filter((name) => name !== aiToolkitTitle)
        ).toEqual(featuredAiSkills.map((skill) => skill.name));
    });

    it('lists the rest of the AI toolkit as chips under its own heading', () => {
        render(<AiShowcase />);

        const toolkit = screen.getByRole('list', { name: aiToolkitTitle });
        expect(
            within(toolkit)
                .getAllByRole('listitem')
                .map((chip) => chip.textContent)
        ).toEqual(aiToolkit.map((skill) => skill.name));
    });
});
