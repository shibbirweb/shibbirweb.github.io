import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Comments from '@/components/pages/articles/Comments';
import { giscusRepo } from '@/config/constants';

describe('Comments', () => {
    it('renders a labelled comments region holding the giscus script', () => {
        render(<Comments />);

        const region = screen.getByRole('region', { name: 'Comments' });
        const script = region.querySelector('script');
        expect(script).not.toBeNull();
        expect(script?.dataset.repo).toBe(giscusRepo);
    });
});
