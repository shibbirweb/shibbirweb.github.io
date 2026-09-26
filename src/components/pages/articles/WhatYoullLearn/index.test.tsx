import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import WhatYoullLearn from '@/components/pages/articles/WhatYoullLearn';

const accentColors = ['#0ea5e9', '#10b981'] as const;

describe('WhatYoullLearn', () => {
    it('renders nothing when there are no takeaways', () => {
        const { container } = render(
            <WhatYoullLearn
                items={[]}
                accentColors={accentColors}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders a section named by its heading with every takeaway', () => {
        render(
            <WhatYoullLearn
                items={[
                    'Tunnel DNS through WireGuard',
                    'Block ads network-wide',
                ]}
                accentColors={accentColors}
            />
        );

        const section = screen.getByRole('region', {
            name: 'What you’ll learn',
        });
        const items = within(section).getAllByRole('listitem');
        expect(items.map((item) => item.textContent)).toEqual([
            'Tunnel DNS through WireGuard',
            'Block ads network-wide',
        ]);
    });

    it('tints the card with the article accent colours', () => {
        render(
            <WhatYoullLearn
                items={['One thing']}
                accentColors={accentColors}
            />
        );

        const section = screen.getByRole('region');
        expect(section.style.getPropertyValue('--accent-from')).toBe('#0ea5e9');
        expect(section.style.getPropertyValue('--accent-to')).toBe('#10b981');
    });
});
