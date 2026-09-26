import { describe, expect, it } from 'vitest';
import {
    spotlightSurfaceAttribute,
    spotlightSurfaceProps,
} from '@/components/pages/common/spotlightSurface';

describe('spotlightSurface', () => {
    it('uses a data attribute so it survives to the DOM', () => {
        expect(spotlightSurfaceAttribute).toBe('data-spotlight-surface');
    });

    it('spreads exactly that attribute, switched on', () => {
        expect(spotlightSurfaceProps).toEqual({
            [spotlightSurfaceAttribute]: true,
        });
    });
});
