import { describe, expect, it } from 'vitest';
import {
    DIAGRAM_TONE_HEX,
    DIAGRAM_TONE_HEX_DARK,
} from '@/components/pages/articles/diagramTones';
import { mermaidConfig } from '@/components/pages/articles/MermaidRenderer/mermaidTheme';

/** Theme variables that are not colours, so khroma never touches them. */
const NON_COLOR_VARIABLES = new Set(['fontFamily', 'fontSize', 'strokeWidth']);

const HEX_COLOR = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;

function colorVariables(isDark: boolean): [string, string][] {
    const variables = mermaidConfig(isDark).themeVariables as Record<
        string,
        string
    >;
    return Object.entries(variables).filter(
        ([name]) => !NON_COLOR_VARIABLES.has(name)
    );
}

describe('mermaidConfig', () => {
    it('never renders on load and builds on the base theme', () => {
        for (const isDark of [false, true]) {
            const config = mermaidConfig(isDark);

            expect(config.startOnLoad).toBe(false);
            expect(config.theme).toBe('base');
        }
    });

    it.each([
        ['light', false],
        ['dark', true],
    ])('gives every %s colour variable a literal hex value', (_, isDark) => {
        const colors = colorVariables(isDark);

        expect(colors.length).toBeGreaterThan(0);
        for (const [name, value] of colors) {
            expect({ name, value }).toEqual({
                name,
                value: expect.stringMatching(HEX_COLOR),
            });
            expect(value).not.toContain('var(');
        }
    });

    it('uses different surface and line colours for light and dark', () => {
        const light = mermaidConfig(false).themeVariables!;
        const dark = mermaidConfig(true).themeVariables!;

        expect(light.background).toBe('#ededed');
        expect(dark.background).toBe('#0a0a0a');
        expect(light.lineColor).toBe(DIAGRAM_TONE_HEX.neutral);
        expect(dark.lineColor).toBe(DIAGRAM_TONE_HEX_DARK.neutral);
        expect(light).not.toEqual(dark);
    });

    it('paints the first gitGraph branches in the site tones', () => {
        const light = mermaidConfig(false).themeVariables!;

        expect([light.git0, light.git1, light.git2, light.git3]).toEqual([
            DIAGRAM_TONE_HEX.neutral,
            DIAGRAM_TONE_HEX.allowed,
            DIAGRAM_TONE_HEX.secure,
            DIAGRAM_TONE_HEX.blocked,
        ]);
        for (let i = 0; i < 8; i++) {
            expect(light[`git${i}`]).toMatch(HEX_COLOR);
            expect(light[`gitBranchLabel${i}`]).toMatch(HEX_COLOR);
        }
    });

    it('keeps live CSS tokens in themeCSS, where var() is safe', () => {
        const css = mermaidConfig(false).themeCSS ?? '';

        expect(css).toContain('var(--background)');
        expect(css).toContain('var(--foreground)');
    });

    it('draws rounded flowchart edges', () => {
        expect(mermaidConfig(false).flowchart?.curve).toBe('rounded');
    });
});
