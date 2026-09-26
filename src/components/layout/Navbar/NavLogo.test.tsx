import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavLogo from '@/components/layout/Navbar/NavLogo';
import { isScrollSyncLocked } from '@/components/layout/scrollSyncLock';

vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
}));

const mockedUsePathname = vi.mocked(usePathname);

describe('NavLogo', () => {
    let scrollToSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        mockedUsePathname.mockReturnValue('/');
        scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        window.history.replaceState(null, '', '/');
    });

    it('is a link home named Home', () => {
        render(<NavLogo />);

        expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
            'href',
            '/'
        );
    });

    it('smooth-scrolls to the top on the home page', () => {
        render(<NavLogo />);

        fireEvent.click(screen.getByRole('link', { name: 'Home' }));

        expect(scrollToSpy).toHaveBeenCalledWith({
            top: 0,
            behavior: 'smooth',
        });
    });

    it('strips the hash but keeps the query on the home page', () => {
        window.history.replaceState(null, '', '/?ref=nav#skills');
        render(<NavLogo />);

        fireEvent.click(screen.getByRole('link', { name: 'Home' }));

        expect(window.location.hash).toBe('');
        expect(window.location.search).toBe('?ref=nav');
    });

    it('holds the URL sync off during the scroll to top', () => {
        render(<NavLogo />);

        fireEvent.click(screen.getByRole('link', { name: 'Home' }));

        expect(isScrollSyncLocked()).toBe(true);
    });

    it('cancels the link navigation on the home page', () => {
        render(<NavLogo />);

        const notCancelled = fireEvent.click(
            screen.getByRole('link', { name: 'Home' })
        );

        expect(notCancelled).toBe(false);
    });

    it('acts as a plain link home on other pages', () => {
        mockedUsePathname.mockReturnValue('/uses');
        render(<NavLogo />);

        fireEvent.click(screen.getByRole('link', { name: 'Home' }));

        expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it('calls onNavigate on every page', () => {
        const onNavigate = vi.fn();
        mockedUsePathname.mockReturnValue('/now');
        render(<NavLogo onNavigate={onNavigate} />);

        fireEvent.click(screen.getByRole('link', { name: 'Home' }));

        expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('merges the caller class onto the link', () => {
        render(<NavLogo className="px-4" />);

        expect(screen.getByRole('link', { name: 'Home' })).toHaveClass(
            'focus-ring',
            'px-4'
        );
    });
});
