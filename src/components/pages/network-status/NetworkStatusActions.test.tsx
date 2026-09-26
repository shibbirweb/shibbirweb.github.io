import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NetworkStatusActions from '@/components/pages/network-status/NetworkStatusActions';

describe('NetworkStatusActions', () => {
    it('offers a Try again button for the delegated reload handler', () => {
        render(<NetworkStatusActions />);

        const retry = screen.getByRole('button', { name: 'Try again' });
        expect(retry).toHaveAttribute('type', 'button');
        expect(retry).toHaveAttribute('data-network-reload');
    });

    it('links back to the home page', () => {
        render(<NetworkStatusActions />);

        expect(screen.getByRole('link', { name: 'Back home' })).toHaveAttribute(
            'href',
            '/'
        );
    });
});
