import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavItem from '@/components/layout/Navbar/NavItem';
import { isScrollSyncLocked } from '@/components/layout/scrollSyncLock';
import type { NavItemData } from '@/components/layout/Navbar/contents';

const sectionItem: NavItemData = {
    label: 'About',
    href: '/#about',
    sectionId: 'about',
};
const pageItem: NavItemData = { label: 'Uses', href: '/uses' };
const externalItem: NavItemData = {
    label: 'Resume PDF',
    href: '/resume.pdf',
    external: true,
};

function renderItem(props: Parameters<typeof NavItem>[0]) {
    return render(
        <ul>
            <NavItem {...props} />
        </ul>
    );
}

describe('NavItem', () => {
    let systemTime = Date.UTC(2030, 0, 1);

    beforeEach(() => {
        // The scroll sync lock is module state keyed on Date.now(), so every
        // test starts far past any lock an earlier test left behind.
        systemTime += 3_600_000;
        vi.useFakeTimers();
        vi.setSystemTime(systemTime);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('marks the active item as the current page', () => {
        renderItem({ item: pageItem, active: true });

        expect(screen.getByRole('link', { name: 'Uses' })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });

    it('leaves inactive items without aria-current', () => {
        renderItem({ item: pageItem, active: false });

        const link = screen.getByRole('link', { name: 'Uses' });
        expect(link).toHaveAttribute('href', '/uses');
        expect(link).not.toHaveAttribute('aria-current');
    });

    it('opens external items in a new tab with a safe rel', () => {
        renderItem({ item: externalItem, active: true });

        const link = screen.getByRole('link', { name: 'Resume PDF' });
        expect(link).toHaveAttribute('href', '/resume.pdf');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).not.toHaveAttribute('aria-current');
    });

    it('keeps internal items in the same tab', () => {
        renderItem({ item: pageItem, active: false });

        expect(screen.getByRole('link', { name: 'Uses' })).not.toHaveAttribute(
            'target'
        );
    });

    it('calls onNavigate when an internal item is clicked', () => {
        const onNavigate = vi.fn();
        renderItem({ item: pageItem, active: false, onNavigate });

        fireEvent.click(screen.getByRole('link', { name: 'Uses' }));

        expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('calls onNavigate when an external item is clicked', () => {
        const onNavigate = vi.fn();
        renderItem({ item: externalItem, active: false, onNavigate });

        fireEvent.click(screen.getByRole('link', { name: 'Resume PDF' }));

        expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('holds the section URL sync off after a section link click', () => {
        renderItem({ item: sectionItem, active: false });

        fireEvent.click(screen.getByRole('link', { name: 'About' }));

        expect(isScrollSyncLocked()).toBe(true);
        vi.advanceTimersByTime(1001);
        expect(isScrollSyncLocked()).toBe(false);
    });

    it('does not lock the URL sync for a page link', () => {
        renderItem({ item: pageItem, active: false });

        fireEvent.click(screen.getByRole('link', { name: 'Uses' }));

        expect(isScrollSyncLocked()).toBe(false);
    });
});
