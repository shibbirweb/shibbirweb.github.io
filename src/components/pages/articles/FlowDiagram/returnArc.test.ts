import { describe, expect, it } from 'vitest';
import {
    isReturnHop,
    RETURN_ARC_DEPTH,
    RETURN_ARC_REACH,
    returnArcPath,
} from '@/components/pages/articles/FlowDiagram/returnArc';

describe('isReturnHop', () => {
    it('is true when the target sits left of the source', () => {
        expect(
            isReturnHop({
                sourceX: 400,
                sourceY: 100,
                targetX: 80,
                targetY: 100,
            })
        ).toBe(true);
    });

    it('is false for a hop that follows the left-to-right flow', () => {
        expect(
            isReturnHop({
                sourceX: 80,
                sourceY: 100,
                targetX: 400,
                targetY: 100,
            })
        ).toBe(false);
    });
});

describe('returnArcPath', () => {
    const ends = { sourceX: 400, sourceY: 100, targetX: 80, targetY: 120 };

    it('draws one cubic curve from the source to the target', () => {
        const [path] = returnArcPath(ends);

        expect(path).toBe(
            `M 400,100 C ${400 + RETURN_ARC_REACH},${120 + RETURN_ARC_DEPTH} ` +
                `${80 - RETURN_ARC_REACH},${120 + RETURN_ARC_DEPTH} 80,120`
        );
    });

    it('swings out past both ends and dips below both handles', () => {
        const [path] = returnArcPath(ends);
        const numbers = path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
        const [
            ,
            ,
            sourceControlX,
            sourceControlY,
            targetControlX,
            targetControlY,
        ] = numbers;

        expect(sourceControlX).toBeGreaterThan(ends.sourceX);
        expect(targetControlX).toBeLessThan(ends.targetX);
        expect(sourceControlY).toBeGreaterThan(ends.targetY);
        expect(targetControlY).toBeGreaterThan(ends.targetY);
    });

    it('puts the label at the lowest point of the arc, between the two ends', () => {
        const [, labelX, labelY] = returnArcPath(ends);

        expect(labelX).toBe(240);
        expect(labelY).toBeCloseTo(
            (100 + 6 * (120 + RETURN_ARC_DEPTH) + 120) / 8
        );
        expect(labelY).toBeGreaterThan(Math.max(ends.sourceY, ends.targetY));
    });
});
