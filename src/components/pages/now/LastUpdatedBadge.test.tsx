import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LastUpdatedBadge from '@/components/pages/now/LastUpdatedBadge';

describe('LastUpdatedBadge', () => {
    it('reads when the page was last updated, with a decorative dot', () => {
        const { container } = render(<LastUpdatedBadge label="June 2026" />);

        expect(container).toHaveTextContent('Last updated June 2026');
        expect(container.querySelector('time')).toHaveTextContent('June 2026');
        expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    });
});
