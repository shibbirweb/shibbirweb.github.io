import { describe, expect, it } from 'vitest';
import { railHeadPosition } from '@/components/pages/articles/TableOfContents/TocRail/railHead';

const range = { top: 36, bottom: 84, topX: 1, bottomX: 13 };

describe('railHeadPosition', () => {
    it('leads with the bottom end while scrolling down', () => {
        expect(railHeadPosition(range, 'down')).toEqual({ x: 13, y: 84 });
    });

    it('leads with the top end while scrolling up', () => {
        expect(railHeadPosition(range, 'up')).toEqual({ x: 1, y: 36 });
    });
});
