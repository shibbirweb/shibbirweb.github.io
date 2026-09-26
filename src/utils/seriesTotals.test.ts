import { describe, expect, it } from 'vitest';
import { buildSeriesTotals } from '@/utils/seriesTotals';

describe('buildSeriesTotals', () => {
    it('counts the parts of each series by name', () => {
        const totals = buildSeriesTotals([
            { series: { name: 'Laravel Deep Dive', order: 1 } },
            { series: { name: 'Laravel Deep Dive', order: 2 } },
            { series: { name: 'Homelab', order: 1 } },
        ]);
        expect(totals).toEqual({ 'Laravel Deep Dive': 2, Homelab: 1 });
    });

    it('ignores articles that are not part of a series', () => {
        const totals = buildSeriesTotals([
            {},
            { series: undefined },
            { series: { name: '', order: 1 } },
            { series: { name: 'Homelab', order: 1 } },
        ]);
        expect(totals).toEqual({ Homelab: 1 });
    });

    it('returns an empty map for an empty corpus', () => {
        expect(buildSeriesTotals([])).toEqual({});
    });
});
