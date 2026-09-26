import { describe, expect, it } from 'vitest';
import { easeToward } from '@/utils/easeToward';

describe('easeToward', () => {
    it('stays put when no time has passed', () => {
        expect(easeToward(0, 10, 0, 100)).toBe(0);
    });

    it('covers about 63% of the distance after one time constant', () => {
        expect(easeToward(0, 10, 100, 100)).toBeCloseTo(6.32, 2);
    });

    it('works in both directions', () => {
        expect(easeToward(10, 0, 100, 100)).toBeCloseTo(3.68, 2);
    });

    it('is frame-rate independent', () => {
        const oneStep = easeToward(0, 1, 32, 200);
        const twoSteps = easeToward(easeToward(0, 1, 16, 200), 1, 16, 200);
        expect(twoSteps).toBeCloseTo(oneStep, 10);
    });

    it('jumps straight to the target without a time constant', () => {
        expect(easeToward(0, 10, 16, 0)).toBe(10);
    });
});
