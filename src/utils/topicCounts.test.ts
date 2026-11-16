import { describe, expect, it } from 'vitest';
import { buildTopicCounts } from '@/utils/topicCounts';

describe('buildTopicCounts', () => {
    it('counts how many items carry each tag', () => {
        expect(
            buildTopicCounts([
                { tags: ['Laravel', 'Debugging'] },
                { tags: ['Laravel'] },
                { tags: ['Git'] },
            ])
        ).toEqual([
            { tag: 'Laravel', count: 2 },
            { tag: 'Debugging', count: 1 },
            { tag: 'Git', count: 1 },
        ]);
    });

    it('puts the busiest topics first and breaks ties alphabetically', () => {
        const topics = buildTopicCounts([
            { tags: ['Zsh', 'Docker'] },
            { tags: ['Docker', 'AI'] },
            { tags: ['Bash'] },
        ]);

        expect(topics.map((topic) => topic.tag)).toEqual([
            'Docker',
            'AI',
            'Bash',
            'Zsh',
        ]);
    });

    it('returns nothing when nothing is tagged', () => {
        expect(buildTopicCounts([])).toEqual([]);
        expect(buildTopicCounts([{ tags: [] }])).toEqual([]);
    });
});
